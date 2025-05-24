import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserService from '../services/UserService';
import OrderService, { Order, Address, PaymentMethod } from '../services/OrderService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    memberSince: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Initialize orders data if needed
    OrderService.initializeSampleData();

    // Set user profile data
    setUserProfile({
      name: currentUser.name,
      email: currentUser.email,
      memberSince: new Date(currentUser.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long'
      })
    });

    // Get user orders, addresses and payment methods
    setOrders(OrderService.getUserOrders());
    setAddresses(OrderService.getUserAddresses());
    setPaymentMethods(OrderService.getUserPaymentMethods());
    
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    UserService.clearCurrentUser();
    navigate('/login');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate form
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    
    // Validate current password
    const currentUser = UserService.getCurrentUser();
    if (!currentUser || currentUser.password !== passwordForm.currentPassword) {
      setPasswordError('Текущий пароль неверен');
      return;
    }
    
    // Update password (in a real app, this would be an API call)
    try {
      // Get all users
      const users = UserService.getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        // Update password
        users[userIndex].password = passwordForm.newPassword;
        UserService.saveUsers(users);
        
        // Update current user
        currentUser.password = passwordForm.newPassword;
        UserService.setCurrentUser(currentUser);
        
        // Show success message
        setPasswordSuccess('Пароль успешно изменен');
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setPasswordError('Ошибка при обновлении пароля');
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
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
        <div className="row">
          <div className="col-md-3">
            <div className="card mb-4">
              <div className="card-header">
                <h5>User Profile</h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`}
                    alt="Profile" 
                    className="rounded-circle img-thumbnail" 
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
                <h5>{userProfile.name}</h5>
                <p className="text-muted">{userProfile.email}</p>
                <p><small>Member since: {userProfile.memberSince}</small></p>
                <button 
                  className="btn btn-outline-danger w-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
            
            <div className="list-group mb-4">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => handleTabChange('orders')}
              >
                My Orders
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => handleTabChange('account')}
              >
                Account Settings
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => handleTabChange('address')}
              >
                Addresses
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => handleTabChange('payment')}
              >
                Payment Methods
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>My Orders</h5>
                  <span className="badge bg-primary rounded-pill">{orders.length}</span>
                </div>
                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="text-center p-4">
                      <p>You have no orders yet.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/products')}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>{new Date(order.date).toLocaleDateString()}</td>
                              <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                              <td>${order.total.toFixed(2)}</td>
                              <td>
                                <span className={`badge ${
                                  order.status === 'Delivered' ? 'bg-success' : 
                                  order.status === 'Shipped' ? 'bg-info' : 
                                  order.status === 'Cancelled' ? 'bg-danger' : 
                                  'bg-warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {/* Order details page would go here */}}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="card">
                <div className="card-header">
                  <h5>Account Settings</h5>
                </div>
                <div className="card-body">
                  <h6 className="mb-3">Change Password</h6>
                  
                  {passwordError && (
                    <div className="alert alert-danger" role="alert">
                      {passwordError}
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="alert alert-success" role="alert">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">Current Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Change Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'address' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>My Addresses</h5>
                  <span className="badge bg-primary rounded-pill">{addresses.length}</span>
                </div>
                <div className="card-body">
                  {addresses.length === 0 ? (
                    <div className="text-center p-4">
                      <p>You have no saved addresses.</p>
                      <p>Addresses from your orders will appear here.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {addresses.map((address, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">Address {index + 1}</h6>
                              <p className="card-text">
                                {address.street}<br />
                                {address.city}, {address.state} {address.zipCode}<br />
                                {address.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>My Payment Methods</h5>
                  <span className="badge bg-primary rounded-pill">{paymentMethods.length}</span>
                </div>
                <div className="card-body">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center p-4">
                      <p>You have no saved payment methods.</p>
                      <p>Payment methods from your orders will appear here.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {paymentMethods.map((method, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">
                                {method.type === 'creditCard' ? 'Credit Card' : 
                                 method.type === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                              </h6>
                              <p className="card-text">
                                {method.name && <span>{method.name}<br /></span>}
                                {method.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 