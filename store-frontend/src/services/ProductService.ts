export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// API URL
const API_URL = 'http://localhost:8080/api';

class ProductService {
  // Get all products from API
  async getProducts(): Promise<Product[]> {
    try {
      // First check if we can get products from API
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const products = await response.json();
      return this.mapApiProductsToLocalFormat(products);
    } catch (error) {
      console.error('Error fetching products from API:', error);
      // Fallback to localStorage if API fails
      return this.getProductsFromLocalStorage();
    }
  }

  // Fallback method to get products from localStorage
  private getProductsFromLocalStorage(): Product[] {
    const productsData = localStorage.getItem('store_products');
    if (!productsData) {
      // Initialize with some default products
      const defaultProducts: Product[] = [
        {
          id: 1,
          name: 'Смартфон XYZ Pro',
          price: 599.99,
          description: 'Мощный смартфон с передовыми технологиями',
          image: 'https://via.placeholder.com/150',
          category: 'Электроника',
          stock: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Ноутбук UltraBook',
          price: 1299.99,
          description: 'Тонкий и легкий ноутбук для профессионалов',
          image: 'https://via.placeholder.com/150',
          category: 'Компьютеры',
          stock: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Беспроводные наушники',
          price: 149.99,
          description: 'Наушники с отличным звуком и шумоподавлением',
          image: 'https://via.placeholder.com/150',
          category: 'Электроника',
          stock: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Умные часы FitTrack',
          price: 249.99,
          description: 'Отслеживайте свою активность и здоровье',
          image: 'https://via.placeholder.com/150',
          category: 'Аксессуары',
          stock: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveProductsToLocalStorage(defaultProducts);
      return defaultProducts;
    }
    return JSON.parse(productsData);
  }

  // Save all products to localStorage (fallback)
  private saveProductsToLocalStorage(products: Product[]): void {
    localStorage.setItem('store_products', JSON.stringify(products));
  }

  // Map API products to local format
  private mapApiProductsToLocalFormat(apiProducts: any[]): Product[] {
    return apiProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      description: product.description || '',
      image: product.image_url || 'https://via.placeholder.com/150',
      category: product.category,
      stock: product.stock,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  // Get product by ID from API
  async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const product = await response.json();
      return this.mapApiProductsToLocalFormat([product])[0];
    } catch (error) {
      console.error(`Error fetching product ${id} from API:`, error);
      // Fallback to localStorage
      return this.getProductByIdFromLocalStorage(id);
    }
  }

  // Fallback method to get product by ID from localStorage
  private getProductByIdFromLocalStorage(id: number): Product | null {
    const products = this.getProductsFromLocalStorage();
    const product = products.find(p => p.id === id);
    return product || null;
  }

  // Create a new product via API
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiProductData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category || 'Без категории',
        image_url: productData.image,
        stock: productData.stock
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiProductData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const newProduct = await response.json();
      return this.mapApiProductsToLocalFormat([newProduct])[0];
    } catch (error) {
      console.error('Error creating product via API:', error);
      // Fallback to localStorage
      return this.createProductInLocalStorage(productData);
    }
  }

  // Fallback method to create product in localStorage
  private createProductInLocalStorage(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProductsFromLocalStorage();
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    this.saveProductsToLocalStorage(products);
    
    return newProduct;
  }

  // Update an existing product via API
  async updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiProductData: any = {};
      if (productData.name !== undefined) apiProductData.name = productData.name;
      if (productData.description !== undefined) apiProductData.description = productData.description;
      if (productData.price !== undefined) apiProductData.price = productData.price;
      if (productData.category !== undefined) apiProductData.category = productData.category;
      if (productData.image !== undefined) apiProductData.image_url = productData.image;
      if (productData.stock !== undefined) apiProductData.stock = productData.stock;

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiProductData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const updatedProduct = await response.json();
      return this.mapApiProductsToLocalFormat([updatedProduct])[0];
    } catch (error) {
      console.error(`Error updating product ${id} via API:`, error);
      // Fallback to localStorage
      return this.updateProductInLocalStorage(id, productData);
    }
  }

  // Fallback method to update product in localStorage
  private updateProductInLocalStorage(id: number, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product | null {
    const products = this.getProductsFromLocalStorage();
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      console.error(`Товар с ID ${id} не найден`);
      return null;
    }
    
    const existingProduct = products[productIndex];
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    // Убедимся, что id и дата создания не изменились
    updatedProduct.id = existingProduct.id;
    updatedProduct.createdAt = existingProduct.createdAt;
    
    products[productIndex] = updatedProduct;
    
    try {
      this.saveProductsToLocalStorage(products);
      console.log(`Товар с ID ${id} успешно обновлен:`, updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
      return null;
    }
  }

  // Delete a product via API
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting product ${id} via API:`, error);
      // Fallback to localStorage
      return this.deleteProductFromLocalStorage(id);
    }
  }

  // Fallback method to delete product from localStorage
  private deleteProductFromLocalStorage(id: number): boolean {
    const products = this.getProductsFromLocalStorage();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      return false; // No product was deleted
    }
    
    this.saveProductsToLocalStorage(filteredProducts);
    return true;
  }

  // Search products by name or description
  async searchProducts(query: string): Promise<Product[]> {
    try {
      // In a real API, you would send the query parameter to the server
      // but many APIs don't support search, so we'll get all products and filter locally
      const products = await this.getProducts();
      
      if (!query) return products;
      
      const lowercaseQuery = query.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.description.toLowerCase().includes(lowercaseQuery) ||
        (product.category && product.category.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback to localStorage
      return this.searchProductsInLocalStorage(query);
    }
  }

  // Fallback method to search products in localStorage
  private searchProductsInLocalStorage(query: string): Product[] {
    if (!query) return this.getProductsFromLocalStorage();
    
    const products = this.getProductsFromLocalStorage();
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery) ||
      (product.category && product.category.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Filter products by price range
  async filterByPrice(min: number, max: number): Promise<Product[]> {
    try {
      // In a real API, you would send filter parameters to the server
      // but we'll get all products and filter locally
      const products = await this.getProducts();
      
      return products.filter(
        product => product.price >= min && product.price <= max
      );
    } catch (error) {
      console.error('Error filtering products by price:', error);
      // Fallback to localStorage
      return this.filterByPriceInLocalStorage(min, max);
    }
  }

  // Fallback method to filter products by price in localStorage
  private filterByPriceInLocalStorage(min: number, max: number): Product[] {
    const products = this.getProductsFromLocalStorage();
    return products.filter(
      product => product.price >= min && product.price <= max
    );
  }

  // Get all available categories
  async getCategories(): Promise<string[]> {
    try {
      // In a real API, you might have a dedicated endpoint for categories
      // but we'll get all products and extract categories locally
      const products = await this.getProducts();
      
      const categoriesSet = new Set<string>();
      
      products.forEach(product => {
        if (product.category) {
          categoriesSet.add(product.category);
        }
      });
      
      return Array.from(categoriesSet).sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      // Fallback to localStorage
      return this.getCategoriesFromLocalStorage();
    }
  }

  // Fallback method to get categories from localStorage
  private getCategoriesFromLocalStorage(): string[] {
    const products = this.getProductsFromLocalStorage();
    const categoriesSet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }

  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default new ProductService(); 