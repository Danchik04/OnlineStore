import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartService, { CartItem } from '../services/CartService';
import OrderService, { Address, PaymentMethod } from '../services/OrderService';
import UserService from '../services/UserService';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Country',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      navigate('/login?redirect=checkout');
      return;
    }

    // Load real cart items
    const items = CartService.getCartItems();
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    setCartItems(items);
    
    // Prefill email with user's email
    setFormData(prev => ({
      ...prev,
      email: currentUser.email || '',
      firstName: currentUser.name?.split(' ')[0] || '',
      lastName: currentUser.name?.split(' ')[1] || ''
    }));

    setLoading(false);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create address object
      const address: Address = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };
      
      // Create payment method object
      const paymentMethod: PaymentMethod = {
        type: 'creditCard',
        details: `**** **** **** ${formData.cardNumber.slice(-4)}`,
        name: formData.cardName
      };
      
      // Calculate total
      const total = calculateTotal();
      
      // Create order using OrderService
      const order = OrderService.createOrder(
        cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image
        })),
        total,
        address,
        paymentMethod
      );
      
      if (order) {
        // Clear the cart after successful order
        CartService.clearCart();
        
        // Redirect to order confirmation page or dashboard
        alert('Your order has been placed successfully!');
        navigate('/dashboard');
      } else {
        alert('There was an error placing your order. Please try again.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error placing your order. Please try again.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
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

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Checkout</h1>
        
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5>Shipping Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-5">
                      <label htmlFor="city" className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="state" className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="zipCode" className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <h5 className="mb-3">Payment Information</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="cardName" className="form-label">Name on Card</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="cardNumber" className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="expDate" className="form-label">Expiration Date</label>
                      <input
                        type="text"
                        className="form-control"
                        id="expDate"
                        name="expDate"
                        placeholder="MM/YY"
                        value={formData.expDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="cvv" className="form-label">CVV</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <button className="btn btn-primary btn-lg w-100" type="submit">
                    Complete Order
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5>Order Summary</h5>
              </div>
              <div className="card-body">
                <ul className="list-group mb-3">
                  {cartItems.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                      <div>
                        <h6 className="my-0">{item.name}</h6>
                        <small className="text-muted">Quantity: {item.quantity}</small>
                      </div>
                      <span className="text-muted">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                  
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Subtotal</span>
                    <strong>${calculateSubtotal().toFixed(2)}</strong>
                  </li>
                  
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Tax (10%)</span>
                    <strong>${calculateTax().toFixed(2)}</strong>
                  </li>
                  
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Shipping</span>
                    <strong>${calculateShipping().toFixed(2)}</strong>
                  </li>
                  
                  <li className="list-group-item d-flex justify-content-between bg-light">
                    <span className="text-success">Total (USD)</span>
                    <strong className="text-success">${calculateTotal().toFixed(2)}</strong>
                  </li>
                </ul>
                
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 