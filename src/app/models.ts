// Models cho Panda Store

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
}

export interface Product {
  _id?: string;
  name: string;
  model: string;
  madeBy: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  categoryId: string | Category;
  createdAt?: Date;
}

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  createdAt?: Date;
}

export interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalPurchase?: number;
  createdAt?: Date;
}

export interface Order {
  _id?: string;
  customerId: string | Customer;
  status: 'pending' | 'paid' | 'cancelled' | 'shipping';
  totalAmount: number;
  note?: string;
  orderDate?: Date;
  paidDate?: Date | null;
  details?: OrderDetail[];
}

export interface OrderDetail {
  _id?: string;
  orderId: string;
  productId: string | Product;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'employee';
  token: string;
}
