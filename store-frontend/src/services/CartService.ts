export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CART_STORAGE_KEY = 'shopping_cart';

class CartService {
  // Get all items from cart
  getCartItems(): CartItem[] {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  }

  // Add item to cart
  addToCart(item: Omit<CartItem, 'quantity'>, quantity: number): void {
    const currentCart = this.getCartItems();
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      currentCart.push({ ...item, quantity });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
  }

  // Update item quantity
  updateQuantity(id: number, quantity: number): void {
    if (quantity < 1) return;
    
    const currentCart = this.getCartItems();
    const updatedCart = currentCart.map(item => 
      item.id === id ? { ...item, quantity } : item
    );

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  }

  // Remove item from cart
  removeItem(id: number): void {
    const currentCart = this.getCartItems();
    const updatedCart = currentCart.filter(item => item.id !== id);
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  }

  // Clear cart
  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  // Get cart total
  getCartTotal(): number {
    return this.getCartItems().reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }

  // Get total items count
  getItemsCount(): number {
    return this.getCartItems().reduce((count, item) => count + item.quantity, 0);
  }
}

export default new CartService(); 