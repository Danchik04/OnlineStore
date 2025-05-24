![Снимок экрана 2025-05-24 190330](https://github.com/user-attachments/assets/257cc4d8-5f45-4d04-af40-e61af00d4436)# Online Store API

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
![Снимок экрана 2025-05-24 190330](https://github.com/user-attachments/assets/e4677023-b604-4ad1-9195-0aeb9b0e7da5)
![Снимок экрана 2025-05-24 190344](https://github.com/user-attachments/assets/8a032936-b7a8-4cd7-8664-ea9444cfc0ff)

![Снимок экрана 2025-05-24 190354](https://github.com/user-attachments/assets/a98d97b4-230d-4b46-8238-8e9c22687fc7)

![Снимок экрана 2025-05-24 190405](https://github.com/user-attachments/assets/423474f2-afc9-4d09-87a7-4ba38ef78b14)

![Снимок экрана 2025-05-24 190426](https://github.com/user-attachments/assets/f3fd263b-7d63-4e4a-ad7a-f6b157876cec)


![Снимок экрана 2025-05-24 190534](https://github.com/user-attachments/assets/4c393972-3e45-41d5-90d1-b395cedc5ca4)

![Снимок экрана 2025-05-24 190553](https://github.com/user-attachments/assets/b905388c-5df9-42d4-a11d-f077ad6d0d77)

![Снимок экрана 2025-05-24 190612](https://github.com/user-attachments/assets/b9bd088e-c4dd-453d-9b2f-a06219c4a625)
![Снимок экрана 2025-05-24 190705](https://github.com/user-attachments/assets/84fdcaa6-46c1-47c0-b90b-b948e9a3a78a)

![Снимок экрана 2025-05-24 190827](https://github.com/user-attachments/assets/3ffdf776-8e35-4817-8490-2976d5aed467)




![Снимок экрана 2025-05-24 191135](https://github.com/user-attachments/assets/c665e3fe-e019-42bb-89d3-13c3220b4abb)

![Снимок экрана 2025-05-24 191225](https://github.com/user-attachments/assets/4c5a179d-6bd2-4ede-9bdb-73f734f9a52b)

![Снимок экрана 2025-05-24 191241](https://github.com/user-attachments/assets/6112d538-54ca-4553-b4e3-bc5fe25c69cf)

![Снимок экрана 2025-05-24 191251](https://github.com/user-attachments/assets/5b2fade1-10fb-4ff4-9e42-b4015d664bbf)

![Снимок экрана 2025-05-24 191307](https://github.com/user-attachments/assets/918c54fc-34f4-44cf-8676-a682da5114b7)

![Снимок экрана 2025-05-24 191328](https://github.com/user-attachments/assets/630a43d6-763e-4082-a546-fb9d7d3d56ca)

![Снимок экрана 2025-05-24 191348](https://github.com/user-attachments/assets/5e60d3a8-2574-45ef-8fe1-6d7dff926c27)

![Снимок экрана 2025-05-24 191355](https://github.com/user-attachments/assets/63f6981b-b2d6-41ad-8f27-48a810e418d9)

![Снимок экрана 2025-05-24 191402](https://github.com/user-attachments/assets/4e6f6f54-5164-41d9-83f5-ad2a02ec7e46)

![Снимок экрана 2025-05-24 191410](https://github.com/user-attachments/assets/7093b411-55e3-4710-b79c-45bc7fe87892)

![Снимок экрана 2025-05-24 191417](https://github.com/user-attachments/assets/6b018f83-6ca7-4e3d-863d-e052ae0ba2dd)
![Снимок экрана 2025-05-24 191448](https://github.com/user-attachments/assets/f4ef83a4-916d-40cb-afbb-6d18f36516fc)

![Снимок экрана 2025-05-24 191528](https://github.com/user-attachments/assets/afd66734-5bc3-4681-90e6-ef3415eba401)

![Снимок экрана 2025-05-24 191545](https://github.com/user-attachments/assets/35a57899-2f75-45c8-9564-7538b3b8443a)

![Снимок экрана 2025-05-24 191553](https://github.com/user-attachments/assets/9b6890e1-3182-48e7-989c-8f1c46e8eedf)

![Снимок экрана 2025-05-24 191603](https://github.com/user-attachments/assets/29568166-96b0-450e-837a-98acaca2e0d9)
![Снимок экрана 2025-05-24 191609](https://github.com/user-attachments/assets/6b358504-e54b-40e8-b7b4-594e79982411)

![Снимок экрана 2025-05-24 191616](https://github.com/user-attachments/assets/6034e79a-d55a-4ee0-b340-a3d0288be0ab)
![Снимок экрана 2025-05-24 191640](https://github.com/user-attachments/assets/c924eb5c-3dfe-4433-999f-67e54197a9e7)




