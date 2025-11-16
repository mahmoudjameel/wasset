export type TransactionStatus = 
  | 'pending'
  | 'accepted'
  | 'escrow'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentMethod = 
  | 'wallet'
  | 'bank_transfer'
  | 'payment_link';

export type TransactionCategory = 
  | 'vehicles'
  | 'properties'
  | 'electronics'
  | 'services'
  | 'renewal'
  | 'other';

export type RenewalSubCategory = 
  | 'vehicles'
  | 'properties'
  | 'online_services'
  | 'other';

export interface Transaction {
  id: string;
  title: string;
  description: string;
  category: TransactionCategory;
  renewalSubCategory?: RenewalSubCategory;
  amount: number;
  commission: number;
  totalAmount: number;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  
  // Seller info
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerConfirmed: boolean;
  sellerDeliveryConfirmed: boolean;
  
  // Buyer info
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerConfirmed: boolean;
  buyerDeliveryConfirmed: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  escrowHoldDate?: Date;
  completionDate?: Date;
  
  // Additional info
  disputeReason?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Date;
  totalTransactions: number;
  completedTransactions: number;
  rating?: number;
  isBlocked?: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  availableBalance: number;
  holdBalance: number;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'commission';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentLink {
  id: string;
  userId: string;
  title: string;
  amount: number;
  description?: string;
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
  usedBy?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'payment' | 'support' | 'system';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}
