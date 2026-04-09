export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  billingAddress: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stockQuantity: number;
  image: string;
}

export interface Inventory {
  id: string;
  productId: string;
  availableQuantity: number;
  lastUpdated: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
}

export type PaymentMethod = 'UPI' | 'card' | 'net banking';
export type PaymentStatus = 'success' | 'failed' | 'pending';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionDate: string;
}

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
}
