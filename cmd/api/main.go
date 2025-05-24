package main

import (
	"log"
	"store/config"
	"store/internal/handlers"
	"store/internal/repository"
	"store/internal/services"
	"store/pkg/auth"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title 		Online Store API
// @version		1.0
// @description	API for an online store
// @host		localhost:8080
// @BasePath	/api

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := repository.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	// Initialize JWT service
	jwtService, err := auth.NewJWTService(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize JWT service: %v", err)
	}

	// Initialize services
	userService := services.NewUserService(userRepo, jwtService)
	productService := services.NewProductService(productRepo)
	cartService := services.NewCartService(cartRepo, productRepo)
	orderService := services.NewOrderService(orderRepo, cartRepo, productRepo)
	paymentService := services.NewPaymentService(cfg, orderRepo)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	productHandler := handlers.NewProductHandler(productService)
	cartHandler := handlers.NewCartHandler(cartService)
	orderHandler := handlers.NewOrderHandler(orderService, paymentService)

	// Initialize Gin router
	router := gin.Default()

	// Middleware
	authMiddleware := handlers.AuthMiddleware(jwtService)
	adminMiddleware := handlers.AdminMiddleware()

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		api.POST("/register", userHandler.Register)
		api.POST("/login", userHandler.Login)

		// User routes
		user := api.Group("/user")
		user.Use(authMiddleware)
		{
			user.GET("", userHandler.GetProfile)
		}

		// Product routes
		products := api.Group("/products")
		{
			products.GET("", productHandler.GetProducts)
			products.GET("/:id", productHandler.GetProduct)

			// Admin-only product management
			products.Use(authMiddleware, adminMiddleware)
			products.POST("", productHandler.CreateProduct)
			products.PUT("/:id", productHandler.UpdateProduct)
			products.DELETE("/:id", productHandler.DeleteProduct)
		}

		// Cart routes
		cart := api.Group("/cart")
		cart.Use(authMiddleware)
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("", cartHandler.AddToCart)
			cart.PUT("/:id", cartHandler.UpdateCartItem)
			cart.DELETE("/:id", cartHandler.RemoveFromCart)
			cart.POST("/clear", cartHandler.ClearCart)
		}

		// Order routes
		orders := api.Group("/orders")
		orders.Use(authMiddleware)
		{
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("", orderHandler.GetOrders)
			orders.GET("/:id", orderHandler.GetOrder)

			// Admin-only order management
			adminOrders := orders.Group("/:id")
			adminOrders.Use(adminMiddleware)
			adminOrders.PUT("/status", orderHandler.UpdateOrderStatus)
		}

		// Payment routes
		api.POST("/pay", authMiddleware, orderHandler.ProcessPayment)

		// Swagger documentation
		api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
	}

	// Start server
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
