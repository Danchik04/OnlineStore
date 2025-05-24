package handlers

import (
	"net/http"
	"store/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CartHandler handles cart-related requests
type CartHandler struct {
	cartService *services.CartService
}

// NewCartHandler creates a new CartHandler
func NewCartHandler(cartService *services.CartService) *CartHandler {
	return &CartHandler{
		cartService: cartService,
	}
}

// GetCart handles retrieving the user's cart
// @Summary Get cart
// @Description Get the current user's cart
// @Tags cart
// @Produce json
// @Security Bearer
// @Success 200 {object} CartResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /cart [get]
func (h *CartHandler) GetCart(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Get cart
	cart, err := h.cartService.GetCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format
	var cartItems []CartItemResponse
	var total float64

	for _, item := range cart.Items {
		subtotal := item.Product.Price * float64(item.Quantity)
		total += subtotal

		cartItems = append(cartItems, CartItemResponse{
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
			Subtotal: subtotal,
		})
	}

	response := CartResponse{
		ID:    cart.ID,
		Items: cartItems,
		Total: total,
	}

	c.JSON(http.StatusOK, response)
}

// AddToCart handles adding an item to the cart
// @Summary Add to cart
// @Description Add a product to the cart
// @Tags cart
// @Accept json
// @Produce json
// @Param item body CartItemRequest true "Cart item details"
// @Security Bearer
// @Success 200 {object} CartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /cart [post]
func (h *CartHandler) AddToCart(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Parse request
	var req CartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Add to cart
	err := h.cartService.AddToCart(userID.(uint), req.ProductID, req.Quantity)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Return updated cart
	cart, err := h.cartService.GetCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format (same as GetCart)
	var cartItems []CartItemResponse
	var total float64

	for _, item := range cart.Items {
		subtotal := item.Product.Price * float64(item.Quantity)
		total += subtotal

		cartItems = append(cartItems, CartItemResponse{
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
			Subtotal: subtotal,
		})
	}

	response := CartResponse{
		ID:    cart.ID,
		Items: cartItems,
		Total: total,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateCartItem handles updating a cart item's quantity
// @Summary Update cart item
// @Description Update the quantity of a cart item
// @Tags cart
// @Accept json
// @Produce json
// @Param id path int true "Cart Item ID"
// @Param item body CartItemRequest true "Cart item details"
// @Security Bearer
// @Success 200 {object} CartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /cart/{id} [put]
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Get item ID from path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid item id"})
		return
	}

	// Parse request
	var req CartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Update cart item
	err = h.cartService.UpdateCartItem(uint(id), req.Quantity)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Return updated cart
	cart, err := h.cartService.GetCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format (same as GetCart)
	var cartItems []CartItemResponse
	var total float64

	for _, item := range cart.Items {
		subtotal := item.Product.Price * float64(item.Quantity)
		total += subtotal

		cartItems = append(cartItems, CartItemResponse{
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
			Subtotal: subtotal,
		})
	}

	response := CartResponse{
		ID:    cart.ID,
		Items: cartItems,
		Total: total,
	}

	c.JSON(http.StatusOK, response)
}

// RemoveFromCart handles removing an item from the cart
// @Summary Remove from cart
// @Description Remove an item from the cart
// @Tags cart
// @Param id path int true "Cart Item ID"
// @Security Bearer
// @Success 200 {object} CartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /cart/{id} [delete]
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Get item ID from path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid item id"})
		return
	}

	// Remove from cart
	err = h.cartService.RemoveFromCart(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Return updated cart
	cart, err := h.cartService.GetCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Convert to response format (same as GetCart)
	var cartItems []CartItemResponse
	var total float64

	for _, item := range cart.Items {
		subtotal := item.Product.Price * float64(item.Quantity)
		total += subtotal

		cartItems = append(cartItems, CartItemResponse{
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
			Subtotal: subtotal,
		})
	}

	response := CartResponse{
		ID:    cart.ID,
		Items: cartItems,
		Total: total,
	}

	c.JSON(http.StatusOK, response)
}

// ClearCart handles clearing all items from the cart
// @Summary Clear cart
// @Description Remove all items from the cart
// @Tags cart
// @Security Bearer
// @Success 200 {object} CartResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /cart/clear [post]
func (h *CartHandler) ClearCart(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	// Clear cart
	err := h.cartService.ClearCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Get empty cart
	cart, err := h.cartService.GetCart(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// Return empty cart
	response := CartResponse{
		ID:    cart.ID,
		Items: []CartItemResponse{},
		Total: 0,
	}

	c.JSON(http.StatusOK, response)
}
