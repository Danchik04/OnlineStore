package handlers

import (
	"net/http"
	"store/internal/services"
	"strconv"
	"time"

	"store/internal/models"

	"github.com/gin-gonic/gin"
)

// OrderHandler handles order-related requests
type OrderHandler struct {
	orderService   *services.OrderService
	paymentService *services.PaymentService
}

// NewOrderHandler creates a new OrderHandler
func NewOrderHandler(orderService *services.OrderService, paymentService *services.PaymentService) *OrderHandler {
	return &OrderHandler{
		orderService:   orderService,
		paymentService: paymentService,
	}
}

// CreateOrder handles creating a new order from the cart
// @Summary Create order
// @Description Create a new order from the cart
// @Tags orders
// @Accept json
// @Produce json
// @Param order body OrderRequest true "Order details"
// @Security Bearer
// @Success 201 {object} OrderResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Parse request
	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Create order
	order, err := h.orderService.CreateOrder(userID.(uint), req.Address, req.ShippingType)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format
	var orderItems []OrderItemResponse
	for _, item := range order.Items {
		orderItems = append(orderItems, OrderItemResponse{
			ID: item.ID,
			Product: ProductResponse{
				ID:          item.Product.ID,
				Name:        item.Product.Name,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				Category:    item.Product.Category,
				Brand:       item.Product.Brand,
				ImageURL:    item.Product.ImageURL,
				Stock:       item.Product.Stock,
			},
			Quantity: item.Quantity,
			Price:    item.Price,
		})
	}

	response := OrderResponse{
		ID:           order.ID,
		Status:       string(order.Status),
		TotalAmount:  order.TotalAmount,
		Items:        orderItems,
		Address:      order.Address,
		ShippingType: order.ShippingType,
		CreatedAt:    order.CreatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusCreated, response)
}

// GetOrders handles retrieving a user's orders
// @Summary Get orders
// @Description Get all orders for the current user
// @Tags orders
// @Produce json
// @Security Bearer
// @Success 200 {array} OrderResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /orders [get]
func (h *OrderHandler) GetOrders(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Get orders
	orders, err := h.orderService.GetUserOrders(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format
	var responses []OrderResponse
	for _, order := range orders {
		var orderItems []OrderItemResponse
		for _, item := range order.Items {
			orderItems = append(orderItems, OrderItemResponse{
				ID: item.ID,
				Product: ProductResponse{
					ID:          item.Product.ID,
					Name:        item.Product.Name,
					Description: item.Product.Description,
					Price:       item.Product.Price,
					Category:    item.Product.Category,
					Brand:       item.Product.Brand,
					ImageURL:    item.Product.ImageURL,
					Stock:       item.Product.Stock,
				},
				Quantity: item.Quantity,
				Price:    item.Price,
			})
		}

		responses = append(responses, OrderResponse{
			ID:           order.ID,
			Status:       string(order.Status),
			TotalAmount:  order.TotalAmount,
			Items:        orderItems,
			Address:      order.Address,
			ShippingType: order.ShippingType,
			PaymentID:    order.PaymentID,
			PaymentType:  order.PaymentType,
			CreatedAt:    order.CreatedAt.Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, responses)
}

// GetOrder handles retrieving a single order
// @Summary Get order
// @Description Get a specific order by ID
// @Tags orders
// @Produce json
// @Param id path int true "Order ID"
// @Security Bearer
// @Success 200 {object} OrderResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /orders/{id} [get]
func (h *OrderHandler) GetOrder(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Get order ID from path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid order id"})
		return
	}

	// Get order
	order, err := h.orderService.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	// Check if the order belongs to the user (unless admin)
	role, _ := c.Get("userRole")
	if order.UserID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Convert to response format
	var orderItems []OrderItemResponse
	for _, item := range order.Items {
		orderItems = append(orderItems, OrderItemResponse{
			ID: item.ID,
			Product: ProductResponse{
				ID:          item.Product.ID,
				Name:        item.Product.Name,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				Category:    item.Product.Category,
				Brand:       item.Product.Brand,
				ImageURL:    item.Product.ImageURL,
				Stock:       item.Product.Stock,
			},
			Quantity: item.Quantity,
			Price:    item.Price,
		})
	}

	response := OrderResponse{
		ID:           order.ID,
		Status:       string(order.Status),
		TotalAmount:  order.TotalAmount,
		Items:        orderItems,
		Address:      order.Address,
		ShippingType: order.ShippingType,
		PaymentID:    order.PaymentID,
		PaymentType:  order.PaymentType,
		CreatedAt:    order.CreatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, response)
}

// ProcessPayment handles payment processing for an order
// @Summary Process payment
// @Description Create payment intent for order
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body PaymentRequest true "Payment details"
// @Security Bearer
// @Success 200 {object} PaymentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /pay [post]
func (h *OrderHandler) ProcessPayment(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Parse request
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Get order
	order, err := h.orderService.GetOrderByID(req.OrderID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	// Check if the order belongs to the user
	if order.UserID != userID.(uint) {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Create payment intent
	paymentID, err := h.paymentService.CreatePaymentIntent(req.OrderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Process payment
	err = h.orderService.ProcessPayment(req.OrderID, paymentID, "stripe")
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Return response
	response := PaymentResponse{
		PaymentID: paymentID,
		// In a real implementation, we would include the client secret
		// ClientSecret: "...",
	}

	c.JSON(http.StatusOK, response)
}

// UpdateOrderStatus handles updating the status of an order (admin only)
// @Summary Update order status
// @Description Update the status of an order (admin only)
// @Tags orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @Param status body string true "New status"
// @Security Bearer
// @Success 200 {object} OrderResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /orders/{id}/status [put]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	// Get order ID from path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid order id"})
		return
	}

	// Parse request
	var statusReq struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&statusReq); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Update status
	err = h.orderService.UpdateOrderStatus(uint(id), models.OrderStatus(statusReq.Status))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Get updated order
	order, err := h.orderService.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format
	var orderItems []OrderItemResponse
	for _, item := range order.Items {
		orderItems = append(orderItems, OrderItemResponse{
			ID: item.ID,
			Product: ProductResponse{
				ID:          item.Product.ID,
				Name:        item.Product.Name,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				Category:    item.Product.Category,
				Brand:       item.Product.Brand,
				ImageURL:    item.Product.ImageURL,
				Stock:       item.Product.Stock,
			},
			Quantity: item.Quantity,
			Price:    item.Price,
		})
	}

	response := OrderResponse{
		ID:           order.ID,
		Status:       string(order.Status),
		TotalAmount:  order.TotalAmount,
		Items:        orderItems,
		Address:      order.Address,
		ShippingType: order.ShippingType,
		PaymentID:    order.PaymentID,
		PaymentType:  order.PaymentType,
		CreatedAt:    order.CreatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, response)
}
