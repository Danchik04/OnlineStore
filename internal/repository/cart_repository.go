package repository

import (
	"errors"
	"store/internal/models"

	"gorm.io/gorm"
)

// CartRepository handles database operations for carts
type CartRepository struct {
	db *gorm.DB
}

// NewCartRepository creates a new CartRepository
func NewCartRepository(database *Database) *CartRepository {
	return &CartRepository{db: database.DB}
}

// GetOrCreateCart gets or creates a cart for a user
func (r *CartRepository) GetOrCreateCart(userID uint) (*models.Cart, error) {
	var cart models.Cart

	// Try to get existing cart
	err := r.db.Where("user_id = ?", userID).Preload("Items.Product").First(&cart).Error

	// If not found, create a new one
	if errors.Is(err, gorm.ErrRecordNotFound) {
		cart = models.Cart{UserID: userID}
		err = r.db.Create(&cart).Error
		if err != nil {
			return nil, err
		}
		return &cart, nil
	}

	if err != nil {
		return nil, err
	}

	return &cart, nil
}

// AddToCart adds a product to the cart
func (r *CartRepository) AddToCart(cartID, productID uint, quantity int) error {
	// Check if item already exists in cart
	var item models.CartItem
	err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error

	// If item already exists, update quantity
	if err == nil {
		item.Quantity += quantity
		return r.db.Save(&item).Error
	}

	// If not found, create new item
	if errors.Is(err, gorm.ErrRecordNotFound) {
		item = models.CartItem{
			CartID:    cartID,
			ProductID: productID,
			Quantity:  quantity,
		}
		return r.db.Create(&item).Error
	}

	return err
}

// UpdateCartItem updates the quantity of an item in the cart
func (r *CartRepository) UpdateCartItem(itemID uint, quantity int) error {
	return r.db.Model(&models.CartItem{}).Where("id = ?", itemID).Update("quantity", quantity).Error
}

// RemoveFromCart removes an item from the cart
func (r *CartRepository) RemoveFromCart(itemID uint) error {
	return r.db.Delete(&models.CartItem{}, itemID).Error
}

// ClearCart removes all items from a cart
func (r *CartRepository) ClearCart(cartID uint) error {
	return r.db.Where("cart_id = ?", cartID).Delete(&models.CartItem{}).Error
}
