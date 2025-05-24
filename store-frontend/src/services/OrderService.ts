import UserService from './UserService';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'creditCard' | 'paypal' | 'bankTransfer';
  details: string; // Last 4 digits or identifier
  name?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  userId: number;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  address: Address;
  paymentMethod: PaymentMethod;
}

const ORDERS_STORAGE_KEY = 'store_orders';

class OrderService {
  // Get all orders
  getAllOrders(): Order[] {
    const ordersData = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!ordersData) {
      return [];
    }
    return JSON.parse(ordersData);
  }
  
  // Get orders for current user
  getUserOrders(): Order[] {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) return [];
    
    const allOrders = this.getAllOrders();
    return allOrders.filter(order => order.userId === currentUser.id);
  }
  
  // Get order by ID
  getOrderById(orderId: number): Order | null {
    const allOrders = this.getAllOrders();
    return allOrders.find(order => order.id === orderId) || null;
  }
  
  // Create a new order
  createOrder(items: OrderItem[], total: number, address: Address, paymentMethod: PaymentMethod): Order | null {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) return null;
    
    const allOrders = this.getAllOrders();
    
    const newOrder: Order = {
      id: allOrders.length ? Math.max(...allOrders.map(o => o.id)) + 1 : 1001,
      userId: currentUser.id,
      date: new Date().toISOString(),
      items,
      total,
      status: 'Processing',
      address,
      paymentMethod
    };
    
    allOrders.push(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
    
    return newOrder;
  }
  
  // Update order status
  updateOrderStatus(orderId: number, newStatus: Order['status']): boolean {
    const allOrders = this.getAllOrders();
    const orderIndex = allOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return false;
    
    allOrders[orderIndex].status = newStatus;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
    
    return true;
  }
  
  // Get user's addresses from orders
  getUserAddresses(): Address[] {
    const userOrders = this.getUserOrders();
    
    // Get unique addresses based on street (simple deduplication)
    const addressMap = new Map<string, Address>();
    userOrders.forEach(order => {
      addressMap.set(order.address.street, order.address);
    });
    
    return Array.from(addressMap.values());
  }
  
  // Get user's payment methods from orders
  getUserPaymentMethods(): PaymentMethod[] {
    const userOrders = this.getUserOrders();
    
    // Get unique payment methods based on details
    const methodMap = new Map<string, PaymentMethod>();
    userOrders.forEach(order => {
      methodMap.set(order.paymentMethod.details, order.paymentMethod);
    });
    
    return Array.from(methodMap.values());
  }
  
  // Initialize with some sample orders if none exist
  initializeSampleData(): void {
    if (this.getAllOrders().length === 0) {
      const users = UserService.getUsers();
      
      // Create sample orders for each user
      users.forEach(user => {
        // Create 1-3 orders per user
        const orderCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < orderCount; i++) {
          const itemCount = Math.floor(Math.random() * 3) + 1;
          const items: OrderItem[] = [];
          let total = 0;
          
          for (let j = 0; j < itemCount; j++) {
            const price = Math.floor(Math.random() * 100) + 10;
            const quantity = Math.floor(Math.random() * 3) + 1;
            items.push({
              productId: j + 1,
              name: `Product ${j + 1}`,
              price,
              quantity,
              imageUrl: `https://picsum.photos/id/${(j + 1) * 10}/200/200`
            });
            total += price * quantity;
          }
          
          this.createOrder(
            items,
            total,
            {
              street: `${user.id} Main St`,
              city: 'City',
              state: 'State',
              zipCode: '12345',
              country: 'Country'
            },
            {
              type: 'creditCard',
              details: `**** **** **** ${1000 + user.id}`,
              name: `${user.name}'s Card`
            }
          );
        }
      });
      
      // Set some orders to different statuses
      const allOrders = this.getAllOrders();
      if (allOrders.length > 0) {
        const statuses: Order['status'][] = ['Processing', 'Shipped', 'Delivered'];
        allOrders.forEach((order, index) => {
          if (index % 3 === 0) {
            this.updateOrderStatus(order.id, statuses[index % statuses.length]);
          }
        });
      }
    }
  }
}

export default new OrderService(); 