package repository

import (
	"errors"
	"store/internal/models"

	"gorm.io/gorm"
)

// ProductRepository handles database operations for products
type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new ProductRepository
func NewProductRepository(database *Database) *ProductRepository {
	return &ProductRepository{db: database.DB}
}

// CreateProduct adds a new product to the database
func (r *ProductRepository) CreateProduct(product *models.Product) error {
	return r.db.Create(product).Error
}

// GetProductByID retrieves a product by ID
func (r *ProductRepository) GetProductByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.First(&product, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}
	return &product, nil
}

// GetProducts retrieves products with optional filters
func (r *ProductRepository) GetProducts(category, brand string, minPrice, maxPrice float64) ([]models.Product, error) {
	var products []models.Product
	query := r.db

	// Apply filters if provided
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if brand != "" {
		query = query.Where("brand = ?", brand)
	}
	if minPrice > 0 {
		query = query.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		query = query.Where("price <= ?", maxPrice)
	}

	err := query.Find(&products).Error
	return products, err
}

// SearchProducts searches for products by name
func (r *ProductRepository) SearchProducts(search string) ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("name ILIKE ?", "%"+search+"%").Find(&products).Error
	return products, err
}

// UpdateProduct updates an existing product
func (r *ProductRepository) UpdateProduct(product *models.Product) error {
	return r.db.Save(product).Error
}

// DeleteProduct deletes a product by ID
func (r *ProductRepository) DeleteProduct(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}
