# Online Store API

A RESTful API for an online store built with Golang and Gin framework.

## Features

- User authentication with JWT
- User roles (user/admin)
- Product management
- Shopping cart functionality
- Order processing
- Payment integration (Stripe mock)
- API documentation with Swagger

## Tech Stack

- Go (Golang)
- Gin Web Framework
- GORM (with PostgreSQL)
- JWT for authentication
- Swagger for API documentation

## Project Structure

```
/cmd             - Main application entry points
  /api           - API server
/config          - Configuration
/internal        - Application code
  /handlers      - HTTP handlers
  /models        - Data models
  /services      - Business logic
  /repository    - Database operations
/pkg             - Reusable packages
  /auth          - Authentication
/migrations      - Database migrations
/docs            - API documentation
```

## Getting Started

### Prerequisites

- Go 1.19+
- PostgreSQL
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/store.git
   cd store
   ```

2. Install dependencies:
   ```
   go mod tidy
   ```

3. Set up the database:
   ```
   # Create a PostgreSQL database named 'store'
   # Then run migrations (not included in this demo)
   ```

4. Configure environment variables:
   ```
   # Copy the example .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the application:
   ```
   go run cmd/api/main.go
   ```

6. Access the API at http://localhost:8080/api
   - API documentation: http://localhost:8080/api/swagger/index.html

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token

### Users
- `GET /api/user` - Get user profile (requires authentication)

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart
- `POST /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Payments
- `POST /api/pay` - Process payment for an order

## License

MIT 

# Store Frontend

A modern e-commerce frontend built with React and TypeScript.

## Features

- Complete shopping flow from product browsing to checkout
- User authentication and registration
- Product listing and details
- Shopping cart management
- Secure checkout process
- User dashboard with order history

## Docker Setup

This project can be run using Docker, which ensures consistent environment across different machines.

### Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

### Running with Docker

1. Clone the repository
   ```
   git clone https://github.com/yourusername/store.git
   cd store
   ```

2. Start the application with Docker Compose
   ```
   docker-compose up
   ```

3. Access the application in your browser
   ```
   http://localhost:3000
   ```

4. To stop the application
   ```
   docker-compose down
   ```

### Building the Docker Image Manually

If you want to build and run just the frontend container:

1. Navigate to the frontend directory
   ```
   cd store-frontend
   ```

2. Build the Docker image
   ```
   docker build -t store-frontend .
   ```

3. Run the container
   ```
   docker run -p 3000:80 store-frontend
   ```

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Navigate to the frontend directory
   ```
   cd store-frontend
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm start
   # or
   yarn start
   ```

4. The application will be available at `http://localhost:3000`

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/services` - API and business logic services
- `/src/assets` - Static assets like images and styles 