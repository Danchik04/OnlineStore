import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartService, { CartItem } from '../services/CartService';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart items from CartService
    setCartItems(CartService.getCartItems());
    setLoading(false);
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    CartService.updateQuantity(id, newQuantity);
    setCartItems(CartService.getCartItems());
  };

  const removeItem = (id: number) => {
    CartService.removeItem(id);
    setCartItems(CartService.getCartItems());
  };

  const calculateTotal = () => {
    return CartService.getCartTotal();
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="card text-center p-5">
            <h2>Ваша корзина пуста</h2>
            <p>Похоже, вы еще не добавили товары в корзину.</p>
            <Link to="/products" className="btn btn-primary">Просмотреть товары</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Ваша корзина</h1>
        
        <div className="card mb-4">
          <div className="card-body">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Товар</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Количество</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img src={item.image} alt={item.name} className="me-3" style={{ width: '50px', height: '50px' }} />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <div className="input-group w-75">
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <input 
                          type="number" 
                          className="form-control text-center" 
                          value={item.quantity}
                          readOnly
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Итого: ${calculateTotal().toFixed(2)}</h4>
              <button 
                className="btn btn-success btn-lg"
                onClick={() => navigate('/checkout')}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
        
        <Link to="/products" className="btn btn-outline-primary">
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
};

export default CartPage; 