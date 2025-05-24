import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import OrderService, { Order } from '../../services/OrderService';
import UserService from '../../services/UserService';

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  // Check if user is admin
  const currentUser = UserService.getCurrentUser();
  const isAdmin = currentUser && ['admin', 'superuser'].includes(currentUser.role);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/forbidden');
      return;
    }
    
    loadOrders();
  }, [isAdmin, navigate]);

  const loadOrders = () => {
    setLoading(true);
    try {
      // Инициализировать тестовые данные, если их нет
      OrderService.initializeSampleData();
      
      const allOrders = OrderService.getAllOrders();
      setOrders(allOrders);
      setError('');
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    try {
      const success = OrderService.updateOrderStatus(orderId, newStatus);
      if (success) {
        // Обновить список заказов
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        
        // Если открыт детальный просмотр заказа, обновить и его
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        
        alert(`Статус заказа #${orderId} изменен на "${newStatus}"`);
      } else {
        alert('Не удалось обновить статус заказа');
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      alert('Ошибка при обновлении статуса заказа');
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск осуществляется на стороне клиента по id и данным пользователя
    loadOrders();
  };

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    // Фильтр по статусу
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    // Поиск по ID или данным пользователя
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toString().includes(searchTerm) || 
        order.address.street.toLowerCase().includes(searchLower) ||
        order.address.city.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Стилизация статуса
  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'Processing': return 'bg-warning';
      case 'Shipped': return 'bg-info';
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Получение имени пользователя по ID
  const getUserName = (userId: number) => {
    const user = UserService.getUsers().find(u => u.id === userId);
    return user ? user.name : `Пользователь #${userId}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4">Управление заказами</h1>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <form onSubmit={handleSearch} className="d-flex mb-3">
                  <input 
                    type="text" 
                    className="form-control me-2" 
                    placeholder="Поиск по ID, адресу или товарам..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Поиск</button>
                </form>
              </div>
              <div className="col-md-4">
                <select 
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Все статусы</option>
                  <option value="Processing">В обработке</option>
                  <option value="Shipped">Отправлен</option>
                  <option value="Delivered">Доставлен</option>
                  <option value="Cancelled">Отменён</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="alert alert-info">
            Заказы не найдены
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Пользователь</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{getUserName(order.userId)}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => viewOrderDetails(order)}
                        >
                          <i className="bi bi-eye"></i> Просмотр
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                          data-bs-toggle="dropdown"
                        >
                          Статус
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handleStatusChange(order.id, 'Processing')}
                              disabled={order.status === 'Processing'}
                            >
                              В обработке
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handleStatusChange(order.id, 'Shipped')}
                              disabled={order.status === 'Shipped'}
                            >
                              Отправлен
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handleStatusChange(order.id, 'Delivered')}
                              disabled={order.status === 'Delivered'}
                            >
                              Доставлен
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger" 
                              onClick={() => handleStatusChange(order.id, 'Cancelled')}
                              disabled={order.status === 'Cancelled'}
                            >
                              Отменён
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями заказа */}
      {showOrderDetails && selectedOrder && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Детали заказа #{selectedOrder.id}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeOrderDetails}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Информация о заказе</h6>
                    <p><strong>Дата:</strong> {formatDate(selectedOrder.date)}</p>
                    <p><strong>Статус:</strong> <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                    <p><strong>Пользователь:</strong> {getUserName(selectedOrder.userId)}</p>
                    <p><strong>Общая сумма:</strong> ${selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Адрес доставки</h6>
                    <p>
                      {selectedOrder.address.street}<br />
                      {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}<br />
                      {selectedOrder.address.country}
                    </p>
                    
                    <h6>Способ оплаты</h6>
                    <p>
                      {selectedOrder.paymentMethod.type === 'creditCard' ? 'Кредитная карта' : 
                       selectedOrder.paymentMethod.type === 'paypal' ? 'PayPal' : 
                       'Банковский перевод'}: {selectedOrder.paymentMethod.details}
                    </p>
                  </div>
                </div>
                
                <h6>Товары</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Наименование</th>
                        <th>Цена</th>
                        <th>Количество</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productId}</td>
                          <td>{item.name}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-active">
                        <td colSpan={4}><strong>Итого:</strong></td>
                        <td><strong>${selectedOrder.total.toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between w-100">
                  <div>
                    <button 
                      className="btn btn-outline-secondary me-2" 
                      onClick={closeOrderDetails}
                    >
                      Закрыть
                    </button>
                  </div>
                  
                  <div className="btn-group">
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                      disabled={selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                    >
                      Отметить как доставленный
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                      disabled={selectedOrder.status === 'Cancelled'}
                    >
                      Отменить заказ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ opacity: 0.5 }}></div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage; 