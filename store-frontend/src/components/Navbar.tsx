import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CartService from '../services/CartService';
import UserService from '../services/UserService';

const Navbar: React.FC = () => {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const currentUser = UserService.getCurrentUser();
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser && ['admin', 'superuser'].includes(currentUser.role);
  const isSuperUser = currentUser && currentUser.role === 'superuser';

  useEffect(() => {
    // Initialize cart count
    updateCartCount();

    // Set up interval to update cart count every 2 seconds
    const interval = setInterval(updateCartCount, 2000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  const updateCartCount = () => {
    setCartItemsCount(CartService.getItemsCount());
  };

  const handleLogout = () => {
    UserService.clearCurrentUser();
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-shop me-2"></i>
          Интернет-магазин
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i> Главная
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                <i className="bi bi-grid me-1"></i> Товары
              </Link>
            </li>
            
            {/* Admin links */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="adminDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-gear me-1"></i> Управление
                </a>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li>
                    <Link className="dropdown-item" to="/admin/products">
                      <i className="bi bi-box me-1"></i> Товары
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/orders">
                      <i className="bi bi-clipboard-check me-1"></i> Заказы
                    </Link>
                  </li>
                  {isSuperUser && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item" to="/admin/users">
                          <i className="bi bi-people me-1"></i> Пользователи
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            )}
            
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <i className="bi bi-person me-1"></i> Личный кабинет
                </Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center">
            <Link className="btn btn-outline-light position-relative me-3" to="/cart">
              <i className="bi bi-cart3"></i> Корзина
              {cartItemsCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartItemsCount}
                  <span className="visually-hidden">товаров в корзине</span>
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i> {currentUser.name}
                  {currentUser.role !== 'user' && (
                    <span className="badge bg-warning text-dark ms-1">
                      {currentUser.role === 'admin' ? 'Админ' : 'Суперадмин'}
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="bi bi-speedometer2 me-1"></i> Панель управления
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person-vcard me-1"></i> Профиль
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-1"></i> Выход
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link className="btn btn-outline-light me-2" to="/login">
                  <i className="bi bi-person-circle me-1"></i> Вход
                </Link>
                <Link className="btn btn-light" to="/register">
                  <i className="bi bi-person-plus me-1"></i> Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 