package services

import (
	"errors"
	"store/internal/models"
	"store/internal/repository"
)

// CartService provides cart-related operations
type CartService struct {
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

// NewCartService creates a new CartService
func NewCartService(cartRepo *repository.CartRepository, productRepo *repository.ProductRepository) *CartService {
	return &CartService{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

// GetCart gets the user's cart
func (s *CartService) GetCart(userID uint) (*models.Cart, error) {
	return s.cartRepo.GetOrCreateCart(userID)
}

// AddToCart adds a product to the user's cart
func (s *CartService) AddToCart(userID, productID uint, quantity int) error {
	// Validate product exists
	product, err := s.productRepo.GetProductByID(productID)
	if err != nil {
		return err
	}

	// Check stock
	if product.Stock < quantity {
		return errors.New("not enough stock available")
	}

	// Get or create cart
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	// Add to cart
	return s.cartRepo.AddToCart(cart.ID, productID, quantity)
}

// UpdateCartItem updates the quantity of an item in the cart
func (s *CartService) UpdateCartItem(itemID uint, quantity int) error {
	return s.cartRepo.UpdateCartItem(itemID, quantity)
}

// RemoveFromCart removes an item from the cart
func (s *CartService) RemoveFromCart(itemID uint) error {
	return s.cartRepo.RemoveFromCart(itemID)
}

// ClearCart removes all items from a user's cart
func (s *CartService) ClearCart(userID uint) error {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	return s.cartRepo.ClearCart(cart.ID)
}
