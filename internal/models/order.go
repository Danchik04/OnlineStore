package models

import (
	"time"

	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
)

type Order struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `gorm:"not null" json:"user_id"`
	User         User           `gorm:"foreignKey:UserID" json:"-"`
	Items        []OrderItem    `json:"items"`
	TotalAmount  float64        `gorm:"not null" json:"total_amount"`
	Status       OrderStatus    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Address      string         `gorm:"not null" json:"address"`
	PaymentID    string         `json:"payment_id"`
	PaymentType  string         `json:"payment_type"`
	ShippingType string         `json:"shipping_type"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type OrderItem struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	OrderID   uint           `gorm:"not null" json:"order_id"`
	Order     Order          `gorm:"foreignKey:OrderID" json:"-"`
	ProductID uint           `gorm:"not null" json:"product_id"`
	Product   Product        `json:"product"`
	Quantity  int            `gorm:"default:1" json:"quantity"`
	Price     float64        `gorm:"not null" json:"price"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
