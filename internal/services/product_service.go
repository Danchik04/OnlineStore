package services

import (
	"store/internal/models"
	"store/internal/repository"
)

// ProductService provides product-related operations
type ProductService struct {
	productRepo *repository.ProductRepository
}

// NewProductService creates a new ProductService
func NewProductService(productRepo *repository.ProductRepository) *ProductService {
	return &ProductService{
		productRepo: productRepo,
	}
}

// CreateProduct creates a new product
func (s *ProductService) CreateProduct(product *models.Product) error {
	return s.productRepo.CreateProduct(product)
}

// GetProductByID retrieves a product by ID
func (s *ProductService) GetProductByID(id uint) (*models.Product, error) {
	return s.productRepo.GetProductByID(id)
}

// GetProducts retrieves products with optional filters
func (s *ProductService) GetProducts(category, brand string, minPrice, maxPrice float64) ([]models.Product, error) {
	return s.productRepo.GetProducts(category, brand, minPrice, maxPrice)
}

// SearchProducts searches products by name
func (s *ProductService) SearchProducts(search string) ([]models.Product, error) {
	return s.productRepo.SearchProducts(search)
}

// UpdateProduct updates an existing product
func (s *ProductService) UpdateProduct(product *models.Product) error {
	return s.productRepo.UpdateProduct(product)
}

// DeleteProduct deletes a product
func (s *ProductService) DeleteProduct(id uint) error {
	return s.productRepo.DeleteProduct(id)
}
