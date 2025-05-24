package services

import (
	"errors"
	"store/internal/models"
	"store/internal/repository"
)

// OrderService provides order-related operations
type OrderService struct {
	orderRepo   *repository.OrderRepository
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

// NewOrderService creates a new OrderService
func NewOrderService(
	orderRepo *repository.OrderRepository,
	cartRepo *repository.CartRepository,
	productRepo *repository.ProductRepository,
) *OrderService {
	return &OrderService{
		orderRepo:   orderRepo,
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

// CreateOrder creates a new order from the user's cart
func (s *OrderService) CreateOrder(userID uint, address, shippingType string) (*models.Order, error) {
	// Get user's cart
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	// Check if cart is empty
	if len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	// Calculate total amount and create order items
	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cart.Items {
		// Get current product data
		product, err := s.productRepo.GetProductByID(item.ProductID)
		if err != nil {
			return nil, err
		}

		// Check stock
		if product.Stock < item.Quantity {
			return nil, errors.New("not enough stock for product: " + product.Name)
		}

		// Create order item
		orderItem := models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		}

		orderItems = append(orderItems, orderItem)
		totalAmount += product.Price * float64(item.Quantity)

		// Update stock
		product.Stock -= item.Quantity
		if err := s.productRepo.UpdateProduct(product); err != nil {
			return nil, err
		}
	}

	// Create order
	order := &models.Order{
		UserID:       userID,
		TotalAmount:  totalAmount,
		Status:       models.OrderStatusPending,
		Address:      address,
		ShippingType: shippingType,
	}

	// Save order
	if err := s.orderRepo.CreateOrder(order); err != nil {
		return nil, err
	}

	// Add items to order
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	order.Items = orderItems

	// Clear cart
	if err := s.cartRepo.ClearCart(cart.ID); err != nil {
		return nil, err
	}

	return order, nil
}

// GetOrderByID gets an order by ID
func (s *OrderService) GetOrderByID(id uint) (*models.Order, error) {
	return s.orderRepo.GetOrderByID(id)
}

// GetUserOrders gets all orders for a user
func (s *OrderService) GetUserOrders(userID uint) ([]models.Order, error) {
	return s.orderRepo.GetUserOrders(userID)
}

// UpdateOrderStatus updates the status of an order
func (s *OrderService) UpdateOrderStatus(orderID uint, status models.OrderStatus) error {
	return s.orderRepo.UpdateOrderStatus(orderID, status)
}

// ProcessPayment processes a payment for an order
func (s *OrderService) ProcessPayment(orderID uint, paymentID, paymentType string) error {
	// Get order - use _ to ignore the actual order value
	_, err := s.orderRepo.GetOrderByID(orderID)
	if err != nil {
		return err
	}

	// Update payment info
	if err := s.orderRepo.UpdatePaymentInfo(orderID, paymentID, paymentType); err != nil {
		return err
	}

	// Update status to processing
	return s.orderRepo.UpdateOrderStatus(orderID, models.OrderStatusProcessing)
}
