package repository

import (
	"errors"
	"store/internal/models"

	"gorm.io/gorm"
)

// OrderRepository handles database operations for orders
type OrderRepository struct {
	db *gorm.DB
}

// NewOrderRepository creates a new OrderRepository
func NewOrderRepository(database *Database) *OrderRepository {
	return &OrderRepository{db: database.DB}
}

// CreateOrder creates a new order
func (r *OrderRepository) CreateOrder(order *models.Order) error {
	return r.db.Create(order).Error
}

// GetOrderByID retrieves an order by ID
func (r *OrderRepository) GetOrderByID(id uint) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items.Product").First(&order, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("order not found")
		}
		return nil, err
	}
	return &order, nil
}

// GetUserOrders retrieves all orders for a user
func (r *OrderRepository) GetUserOrders(userID uint) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Where("user_id = ?", userID).Preload("Items.Product").Find(&orders).Error
	return orders, err
}

// UpdateOrderStatus updates the status of an order
func (r *OrderRepository) UpdateOrderStatus(orderID uint, status models.OrderStatus) error {
	return r.db.Model(&models.Order{}).Where("id = ?", orderID).Update("status", status).Error
}

// UpdatePaymentInfo updates the payment information of an order
func (r *OrderRepository) UpdatePaymentInfo(orderID uint, paymentID, paymentType string) error {
	return r.db.Model(&models.Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"payment_id":   paymentID,
		"payment_type": paymentType,
	}).Error
}
