import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';

// Admin Pages
import ProductManagementPage from './pages/admin/ProductManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          
          {/* Protected Routes (User) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser']} />}>
            <Route path="/admin/products" element={<ProductManagementPage />} />
          </Route>
          
          {/* Superuser Routes */}
          <Route element={<ProtectedRoute requiredRoles="superuser" />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>
          
          {/* New Admin Routes */}
          <Route element={<ProtectedRoute requiredRoles="admin" />}>
            <Route path="/admin/orders" element={<OrderManagementPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
