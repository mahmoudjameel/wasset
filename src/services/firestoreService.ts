import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper function to convert Firestore Timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date(timestamp.seconds * 1000);
};

// ============ USERS SERVICE ============
export interface FirestoreUser {
  id: string;
  uid: string;
  displayName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  username?: string;
  userType?: 'buyer' | 'seller' | 'both';
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  registrationDate?: any;
  createdAt?: any;
  lastLoginDate?: any;
  transactionCount?: number;
  totalSpent?: number;
  totalEarned?: number;
}

export const firestoreUsersService = {
  getAll: async (limitCount: number = 1000): Promise<FirestoreUser[]> => {
    try {
      const usersRef = collection(db, 'users');
      // جلب جميع المستخدمين بدون قيود
      let q = query(usersRef, orderBy('createdAt', 'desc'));
      if (limitCount > 0) {
        q = query(usersRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
      }
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid || doc.id,
          displayName: data.displayName || data.fullName || data.username || 'غير محدد',
          fullName: data.fullName || data.displayName || data.username,
          email: data.email || '',
          phone: data.phone || '',
          username: data.username || '',
          userType: data.userType || 'buyer',
          verificationStatus: data.verificationStatus || 'pending',
          registrationDate: convertTimestamp(data.createdAt || data.registrationDate),
          createdAt: convertTimestamp(data.createdAt),
          lastLoginDate: convertTimestamp(data.lastLoginDate),
          transactionCount: data.transactionCount || 0,
          totalSpent: data.totalSpent || 0,
          totalEarned: data.totalEarned || 0,
          isBlocked: data.isBlocked || false, // إضافة حقل الحظر
        };
      });
      
      console.log(`[Firestore] تم جلب ${users.length} مستخدم من Firestore`);
      return users;
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      throw error;
    }
  },

  getById: async (userId: string): Promise<FirestoreUser | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          uid: data.uid || userSnap.id,
          displayName: data.displayName || data.fullName || data.username || 'غير محدد',
          fullName: data.fullName || data.displayName || data.username,
          email: data.email || '',
          phone: data.phone || '',
          username: data.username || '',
          userType: data.userType || 'buyer',
          verificationStatus: data.verificationStatus || 'pending',
          registrationDate: convertTimestamp(data.createdAt || data.registrationDate),
          createdAt: convertTimestamp(data.createdAt),
          lastLoginDate: convertTimestamp(data.lastLoginDate),
          transactionCount: data.transactionCount || 0,
          totalSpent: data.totalSpent || 0,
          totalEarned: data.totalEarned || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      throw error;
    }
  },

  update: async (userId: string, data: Partial<FirestoreUser>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  blockUser: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBlocked: true,
        blockedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  unblockUser: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBlocked: false,
        blockedAt: null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },
};

// ============ TRANSACTIONS SERVICE ============
export interface FirestoreTransaction {
  id: string;
  title: string;
  buyerId?: string;
  sellerId?: string;
  buyerName?: string;
  sellerName?: string;
  buyerEmail?: string;
  sellerEmail?: string;
  amount: number;
  commission?: number;
  status: string;
  paymentMethod?: string;
  createdAt: Date;
  completedAt?: Date;
  description?: string;
  category?: string;
  adminNotes?: string;
}

export const firestoreTransactionsService = {
  getAll: async (limitCount: number = 1000): Promise<FirestoreTransaction[]> => {
    try {
      const transactionsRef = collection(db, 'transactions');
      // جلب جميع المعاملات بدون قيود
      let q = query(transactionsRef, orderBy('createdAt', 'desc'));
      if (limitCount > 0) {
        q = query(transactionsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
      }
      const querySnapshot = await getDocs(q);

      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'معاملة بدون عنوان',
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          buyerName: data.buyerName || 'غير محدد',
          sellerName: data.sellerName || 'غير محدد',
          buyerEmail: data.buyerEmail || '',
          sellerEmail: data.sellerEmail || '',
          amount: data.amount || 0,
          commission: data.commission || 0,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'غير محدد',
          createdAt: convertTimestamp(data.createdAt),
          completedAt: data.completionDate ? convertTimestamp(data.completionDate) : undefined,
          description: data.description || '',
          category: data.category || '',
          adminNotes: data.adminNotes || '',
        };
      });
      
      console.log(`[Firestore] تم جلب ${transactions.length} معاملة من Firestore`);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions from Firestore:', error);
      throw error;
    }
  },

  getById: async (transactionId: string): Promise<FirestoreTransaction | null> => {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        const data = transactionSnap.data();
        return {
          id: transactionSnap.id,
          title: data.title || 'معاملة بدون عنوان',
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          buyerName: data.buyerName || 'غير محدد',
          sellerName: data.sellerName || 'غير محدد',
          amount: data.amount || 0,
          commission: data.commission || 0,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'غير محدد',
          createdAt: convertTimestamp(data.createdAt),
          completedAt: data.completionDate ? convertTimestamp(data.completionDate) : undefined,
          description: data.description || '',
          category: data.category || '',
          adminNotes: data.adminNotes || '',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching transaction from Firestore:', error);
      throw error;
    }
  },

  getByStatus: async (status: string, limitCount: number = 1000): Promise<FirestoreTransaction[]> => {
    try {
      const transactionsRef = collection(db, 'transactions');
      // جلب جميع المعاملات حسب الحالة
      let q = query(
        transactionsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      if (limitCount > 0) {
        q = query(
          transactionsRef,
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limitCount)
        );
      }
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'معاملة بدون عنوان',
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          buyerName: data.buyerName || 'غير محدد',
          sellerName: data.sellerName || 'غير محدد',
          amount: data.amount || 0,
          commission: data.commission || 0,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'غير محدد',
          createdAt: convertTimestamp(data.createdAt),
          completedAt: data.completionDate ? convertTimestamp(data.completionDate) : undefined,
          description: data.description || '',
          category: data.category || '',
          adminNotes: data.adminNotes || '',
        };
      });
    } catch (error) {
      console.error('Error fetching transactions by status from Firestore:', error);
      throw error;
    }
  },

  update: async (transactionId: string, data: Partial<FirestoreTransaction>): Promise<void> => {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  updateStatus: async (transactionId: string, status: string, adminNotes?: string): Promise<void> => {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      await updateDoc(transactionRef, updateData);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },
};

// ============ WALLETS SERVICE ============
export interface FirestoreWallet {
  id: string;
  userId: string;
  balance: number;
  availableBalance: number;
  holdBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export const firestoreWalletsService = {
  getAll: async (limitCount: number = 1000): Promise<FirestoreWallet[]> => {
    try {
      const walletsRef = collection(db, 'wallets');
      // جلب جميع المحافظ بدون قيود
      let q = query(walletsRef, orderBy('updatedAt', 'desc'));
      if (limitCount > 0) {
        q = query(walletsRef, orderBy('updatedAt', 'desc'), firestoreLimit(limitCount));
      }
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || doc.id,
          balance: data.balance || 0,
          availableBalance: data.availableBalance || 0,
          holdBalance: data.holdBalance || 0,
          totalDeposits: data.totalDeposits || 0,
          totalWithdrawals: data.totalWithdrawals || 0,
          currency: data.currency || 'EGP',
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Error fetching wallets from Firestore:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string): Promise<FirestoreWallet | null> => {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        return {
          id: walletSnap.id,
          userId: data.userId || walletSnap.id,
          balance: data.balance || 0,
          availableBalance: data.availableBalance || 0,
          holdBalance: data.holdBalance || 0,
          totalDeposits: data.totalDeposits || 0,
          totalWithdrawals: data.totalWithdrawals || 0,
          currency: data.currency || 'EGP',
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching wallet from Firestore:', error);
      throw error;
    }
  },
};

// ============ PAYMENT LINKS SERVICE ============
export interface FirestorePaymentLink {
  id: string;
  sellerId: string;
  sellerName?: string;
  title: string;
  description?: string;
  amount: number;
  commission?: number;
  totalAmount?: number;
  isActive: boolean;
  clickCount: number;
  completedTransactions: number;
  shortCode?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const firestorePaymentLinksService = {
  getAll: async (limitCount: number = 1000): Promise<FirestorePaymentLink[]> => {
    try {
      const paymentLinksRef = collection(db, 'paymentLinks');
      // جلب جميع روابط الدفع بدون قيود
      let q = query(paymentLinksRef, orderBy('createdAt', 'desc'));
      if (limitCount > 0) {
        q = query(paymentLinksRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
      }
      const querySnapshot = await getDocs(q);

      const paymentLinks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sellerId: data.sellerId || '',
          sellerName: data.sellerName || 'غير محدد',
          title: data.title || '',
          description: data.description || '',
          amount: data.amount || 0,
          commission: data.commission || 0,
          totalAmount: data.totalAmount || data.amount || 0,
          isActive: data.isActive !== false,
          clickCount: data.clickCount || 0,
          completedTransactions: data.completedTransactions || 0,
          shortCode: data.shortCode || '',
          expiresAt: data.expiresAt ? convertTimestamp(data.expiresAt) : undefined,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
      
      console.log(`[Firestore] تم جلب ${paymentLinks.length} رابط دفع من Firestore`);
      return paymentLinks;
    } catch (error) {
      console.error('Error fetching payment links from Firestore:', error);
      throw error;
    }
  },

  getById: async (linkId: string): Promise<FirestorePaymentLink | null> => {
    try {
      const linkRef = doc(db, 'paymentLinks', linkId);
      const linkSnap = await getDoc(linkRef);

      if (linkSnap.exists()) {
        const data = linkSnap.data();
        return {
          id: linkSnap.id,
          sellerId: data.sellerId || '',
          sellerName: data.sellerName || 'غير محدد',
          title: data.title || '',
          description: data.description || '',
          amount: data.amount || 0,
          commission: data.commission || 0,
          totalAmount: data.totalAmount || data.amount || 0,
          isActive: data.isActive !== false,
          clickCount: data.clickCount || 0,
          completedTransactions: data.completedTransactions || 0,
          shortCode: data.shortCode || '',
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching payment link from Firestore:', error);
      throw error;
    }
  },

  update: async (linkId: string, data: Partial<FirestorePaymentLink>): Promise<void> => {
    try {
      const linkRef = doc(db, 'paymentLinks', linkId);
      await updateDoc(linkRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating payment link:', error);
      throw error;
    }
  },

  toggleActive: async (linkId: string, isActive: boolean): Promise<void> => {
    try {
      const linkRef = doc(db, 'paymentLinks', linkId);
      await updateDoc(linkRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling payment link:', error);
      throw error;
    }
  },
};

// ============ WALLET TRANSACTIONS SERVICE ============
export interface FirestoreWalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
}

export const firestoreWalletService = {
  getAllTransactions: async (limitCount: number = 1000): Promise<FirestoreWalletTransaction[]> => {
    try {
      const walletTransactionsRef = collection(db, 'wallet_transactions');
      // جلب جميع معاملات المحفظة بدون قيود
      let q = query(walletTransactionsRef, orderBy('createdAt', 'desc'));
      if (limitCount > 0) {
        q = query(walletTransactionsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
      }
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          type: data.type || 'unknown',
          amount: data.amount || 0,
          description: data.description || '',
          status: data.status || 'pending',
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Error fetching wallet transactions from Firestore:', error);
      throw error;
    }
  },
};

// ============ SUPPORT TICKETS SERVICE ============
export interface FirestoreSupportTicket {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}

export const firestoreSupportService = {
  getAll: async (limitCount: number = 1000): Promise<FirestoreSupportTicket[]> => {
    try {
      const ticketsRef = collection(db, 'support_tickets');
      let q = query(ticketsRef, orderBy('createdAt', 'desc'));
      if (limitCount > 0) {
        q = query(ticketsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
      }

      const querySnapshot = await getDocs(q);

      const tickets = querySnapshot.docs.map((doc) => {
        const data = doc.data() as any;

        // توحيد حالات التذكرة:
        // seedDatabase يستخدم: new, in_progress, completed, closed
        // الموبايل واللوحة يستخدمان: open, in_progress, resolved, closed
        const rawStatus = data.status || 'open';
        const normalizedStatus =
          rawStatus === 'new'
            ? 'open'
            : rawStatus === 'completed'
            ? 'resolved'
            : rawStatus;

        return {
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || data.user_name || 'غير محدد',
          userEmail: data.userEmail || data.user_email || '',
          // توحيد الحقول بين seedDatabase (title/description) وبين الموبايل (subject/message)
          subject: data.subject || data.title || 'بدون عنوان',
          message: data.message || data.description || '',
          status: normalizedStatus,
          priority: data.priority || 'medium',
          category: data.category || 'other',
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : convertTimestamp(data.createdAt),
          resolvedAt: data.resolvedAt ? convertTimestamp(data.resolvedAt) : undefined,
        } as FirestoreSupportTicket;
      });

      console.log(`[Firestore] تم جلب ${tickets.length} تذكرة دعم من Firestore`);
      return tickets;
    } catch (error) {
      console.error('Error fetching support tickets from Firestore:', error);
      throw error;
    }
  },

  updateStatus: async (ticketId: string, status: string): Promise<void> => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      const updates: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'resolved' || status === 'closed' || status === 'completed') {
        updates.resolvedAt = serverTimestamp();
      }

      await updateDoc(ticketRef, updates);
    } catch (error) {
      console.error('Error updating support ticket status:', error);
      throw error;
    }
  },
};
