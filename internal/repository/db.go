package repository

import (
	"fmt"
	"log"
	"store/config"
	"store/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Database represents the database repository
type Database struct {
	DB *gorm.DB
}

// NewDatabase initializes and returns a new Database repository
func NewDatabase(cfg *config.Config) (*Database, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Connected to database successfully")
	return &Database{DB: db}, nil
}
