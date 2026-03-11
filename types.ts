
export enum UserRole {
  STUDENT = 'STUDENT',
  EMPLOYEE = 'EMPLOYEE'
}

export enum OrderStatus {
  PLACED = 'PLACED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum PaymentMethod {
  CREDITS = 'Campus Credits',
  CASH = 'Cash at Counter',
  CARD = 'Credit/Debit Card'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  rating: number;
  reviewCount: number;
  prepTime?: number; // minutes
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userType: 'Student' | 'Staff';
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  timestamp: string;
  prepTime?: number; // estimated prep minutes (max across all items)
  estimatedCompletion?: string;
}
