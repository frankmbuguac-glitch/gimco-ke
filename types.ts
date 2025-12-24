// This file represents the "Database Schema" requirements from the prompt.
// In a real backend, these would be PostgreSQL tables (Users, Orders, OrderItems, Products).

export enum ItemType {
  SERVICE = 'SERVICE', // Custom Tailoring
  PRODUCT = 'PRODUCT'  // Ready-made (e.g., Ties, Perfume)
}

export type ItemCategory = 'MEN' | 'WOMEN' | 'ACCESSORIES';

export type Occasion = 
  | 'Business Formal' 
  | 'Business Casual' 
  | 'Smart Casual' 
  | 'Traditional Wear' 
  | 'Wedding' 
  | 'Burial' 
  | 'Corporate Branding';

// ---------------------------------------------------------
// DUAL TRACKING STATUS ENUMS
// ---------------------------------------------------------

// Manufacturing Stages for Custom Services
export enum ServiceStage {
  MEASUREMENTS_PENDING = 'MEASUREMENTS_PENDING',
  CUTTING = 'CUTTING',
  STITCHING = 'STITCHING',
  FITTING = 'FITTING',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}

// Logistics Stages for Physical Products
export enum ProductLogisticsStage {
  ORDER_PLACED = 'ORDER_PLACED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

// ---------------------------------------------------------
// DATA MODELS
// ---------------------------------------------------------

export interface Measurements {
  chest: number;
  waist: number;
  inseam: number;
  shoulders: number;
  sleeve: number;
  [key: string]: number; // Allow index signature for dynamic access
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added for WhatsApp contact
  isAdmin?: boolean;
  measurements: Measurements;
}

export interface CatalogItemHistory {
  date: string;
  change: string;
}

export interface CatalogItem {
  id: string;
  type: ItemType;
  category: ItemCategory;
  name: string;
  description: string;
  price: number;
  image: string;
  history?: CatalogItemHistory[]; // Added for tracking changes
  occasions?: Occasion[]; // Added for occasion filtering
}

// The OrderItem discriminates based on 'type' to determine which status field is relevant
// This mimics a Polymorphic relationship or a Single Table Inheritance strategy in SQL.
export interface OrderItem {
  id: string;
  orderId: string;
  catalogItem: CatalogItem;
  quantity: number;
  
  // The architecture requires tracking these differently
  status: ServiceStage | ProductLogisticsStage;
  
  // For services, we link specific measurements snapshot used for this order
  customMeasurements?: Measurements;
  
  // Added for admin management
  estimatedDelivery?: string; 
}

export interface Order {
  id: string;
  userId: string;
  customerName: string; // Snapshot for easier admin search
  customerPhone: string; // Snapshot for easier admin search
  date: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
}

export interface CartItem extends CatalogItem {
  cartId: string; // unique ID for the cart instance
}