package handlers

// Request DTOs

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone" binding:"required"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// ProductRequest represents a product creation/update request
type ProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Brand       string  `json:"brand"`
	ImageURL    string  `json:"image_url"`
	Stock       int     `json:"stock" binding:"gte=0"`
}

// CartItemRequest represents a request to add/update a cart item
type CartItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

// OrderRequest represents an order creation request
type OrderRequest struct {
	Address      string `json:"address" binding:"required"`
	ShippingType string `json:"shipping_type" binding:"required"`
}

// PaymentRequest represents a payment request
type PaymentRequest struct {
	OrderID uint `json:"order_id" binding:"required"`
}

// Response DTOs

// TokenResponse represents a JWT token response
type TokenResponse struct {
	Token string `json:"token"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// ProductsResponse represents a paginated list of products
type ProductsResponse struct {
	Products []ProductResponse `json:"products"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
}

// ProductResponse represents a product response
type ProductResponse struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	Brand       string  `json:"brand"`
	ImageURL    string  `json:"image_url"`
	Stock       int     `json:"stock"`
}

// CartResponse represents a shopping cart response
type CartResponse struct {
	ID    uint               `json:"id"`
	Items []CartItemResponse `json:"items"`
	Total float64            `json:"total"`
}

// CartItemResponse represents a cart item response
type CartItemResponse struct {
	ID       uint            `json:"id"`
	Product  ProductResponse `json:"product"`
	Quantity int             `json:"quantity"`
	Subtotal float64         `json:"subtotal"`
}

// OrderResponse represents an order response
type OrderResponse struct {
	ID           uint                `json:"id"`
	Status       string              `json:"status"`
	TotalAmount  float64             `json:"total_amount"`
	Items        []OrderItemResponse `json:"items"`
	Address      string              `json:"address"`
	ShippingType string              `json:"shipping_type"`
	PaymentID    string              `json:"payment_id,omitempty"`
	PaymentType  string              `json:"payment_type,omitempty"`
	CreatedAt    string              `json:"created_at"`
}

// OrderItemResponse represents an order item response
type OrderItemResponse struct {
	ID       uint            `json:"id"`
	Product  ProductResponse `json:"product"`
	Quantity int             `json:"quantity"`
	Price    float64         `json:"price"`
}

// PaymentResponse represents a payment response
type PaymentResponse struct {
	PaymentID    string `json:"payment_id"`
	ClientSecret string `json:"client_secret,omitempty"` // For Stripe
}

// QueryParams for filtering/pagination

// ProductQueryParams represents query parameters for product filtering
type ProductQueryParams struct {
	Category string  `form:"category"`
	Brand    string  `form:"brand"`
	MinPrice float64 `form:"min_price"`
	MaxPrice float64 `form:"max_price"`
	Search   string  `form:"search"`
	Page     int     `form:"page,default=1"`
	Limit    int     `form:"limit,default=10"`
}
