package handlers

import (
	"net/http"
	"store/internal/models"
	"store/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ProductHandler handles product-related requests
type ProductHandler struct {
	productService *services.ProductService
}

// NewProductHandler creates a new ProductHandler
func NewProductHandler(productService *services.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// GetProducts handles retrieving products with optional filters
// @Summary Get products
// @Description Get a list of products with optional filters
// @Tags products
// @Produce json
// @Param category query string false "Category filter"
// @Param brand query string false "Brand filter"
// @Param min_price query number false "Minimum price filter"
// @Param max_price query number false "Maximum price filter"
// @Param search query string false "Search term"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Page size (default: 10)"
// @Success 200 {object} ProductsResponse
// @Failure 400 {object} ErrorResponse
// @Router /products [get]
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var params ProductQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	products, err := h.productService.GetProducts(params.Category, params.Brand, params.MinPrice, params.MaxPrice)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	// If search is provided, use search instead of filters
	if params.Search != "" {
		products, err = h.productService.SearchProducts(params.Search)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
			return
		}
	}

	// Convert to response format
	var productResponses []ProductResponse
	for _, product := range products {
		productResponses = append(productResponses, ProductResponse{
			ID:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			Price:       product.Price,
			Category:    product.Category,
			Brand:       product.Brand,
			ImageURL:    product.ImageURL,
			Stock:       product.Stock,
		})
	}

	response := ProductsResponse{
		Products: productResponses,
		Total:    int64(len(productResponses)),
		Page:     params.Page,
		Limit:    params.Limit,
	}

	c.JSON(http.StatusOK, response)
}

// GetProduct handles retrieving a single product by ID
// @Summary Get a product
// @Description Get a product by ID
// @Tags products
// @Produce json
// @Param id path int true "Product ID"
// @Success 200 {object} ProductResponse
// @Failure 404 {object} ErrorResponse
// @Router /products/{id} [get]
func (h *ProductHandler) GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid product id"})
		return
	}

	product, err := h.productService.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	response := ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Category:    product.Category,
		Brand:       product.Brand,
		ImageURL:    product.ImageURL,
		Stock:       product.Stock,
	}

	c.JSON(http.StatusOK, response)
}

// CreateProduct handles creating a new product
// @Summary Create a product
// @Description Create a new product (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Param product body ProductRequest true "Product details"
// @Security Bearer
// @Success 201 {object} ProductResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Router /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	product := models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		Brand:       req.Brand,
		ImageURL:    req.ImageURL,
		Stock:       req.Stock,
	}

	err := h.productService.CreateProduct(&product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	response := ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Category:    product.Category,
		Brand:       product.Brand,
		ImageURL:    product.ImageURL,
		Stock:       product.Stock,
	}

	c.JSON(http.StatusCreated, response)
}

// UpdateProduct handles updating an existing product
// @Summary Update a product
// @Description Update an existing product (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Param id path int true "Product ID"
// @Param product body ProductRequest true "Product details"
// @Security Bearer
// @Success 200 {object} ProductResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid product id"})
		return
	}

	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Get existing product
	existingProduct, err := h.productService.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	// Update fields
	existingProduct.Name = req.Name
	existingProduct.Description = req.Description
	existingProduct.Price = req.Price
	existingProduct.Category = req.Category
	existingProduct.Brand = req.Brand
	existingProduct.ImageURL = req.ImageURL
	existingProduct.Stock = req.Stock

	// Save updates
	err = h.productService.UpdateProduct(existingProduct)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	response := ProductResponse{
		ID:          existingProduct.ID,
		Name:        existingProduct.Name,
		Description: existingProduct.Description,
		Price:       existingProduct.Price,
		Category:    existingProduct.Category,
		Brand:       existingProduct.Brand,
		ImageURL:    existingProduct.ImageURL,
		Stock:       existingProduct.Stock,
	}

	c.JSON(http.StatusOK, response)
}

// DeleteProduct handles deleting a product
// @Summary Delete a product
// @Description Delete an existing product (admin only)
// @Tags products
// @Param id path int true "Product ID"
// @Security Bearer
// @Success 204 {object} nil
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid product id"})
		return
	}

	// Check if product exists
	_, err = h.productService.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	// Delete product
	err = h.productService.DeleteProduct(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
