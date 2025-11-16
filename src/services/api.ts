import { auth } from '../config/firebase';
import { API_CONFIG, simulateApiDelay, shouldSimulateFailure } from '../config/api';
import { mockTransactions, mockUsers, mockPaymentLinks, mockSupportTickets, mockWalletTransactions } from '../data/mockData';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return 'mock-token';
  }
  
  const user = auth.currentUser;
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  return await user.getIdToken();
};

// Generic API request function
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  if (API_CONFIG.USE_MOCK_DATA) {
    // Simulate API delay
    await simulateApiDelay();
    
    // Simulate API failures
    if (shouldSimulateFailure()) {
      throw new Error('فشل في الاتصال بالخادم');
    }
    
    // Return mock response format
    return { success: true };
  }

  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ============ AUTH API ============
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم تسجيل الدخول بنجاح' };
    }
    
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    }
    
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// ============ USERS API ============
export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  userType: 'buyer' | 'seller';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  registrationDate: Date;
  lastLoginDate: Date;
  transactionCount: number;
  totalSpent?: number;
  totalEarned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<User[]>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || API_CONFIG.MOCK_CONFIG.DEFAULT_PAGE_SIZE;
      const search = params?.search || '';
      
      let filteredUsers = mockUsers;
      
      if (search) {
        filteredUsers = mockUsers.filter(user => 
          user.displayName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return apiRequest(`/users?${queryParams.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const user = mockUsers.find(u => u.uid === id);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }
      
      return { success: true, data: user };
    }
    
    return apiRequest(`/users/${id}`);
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم تحديث بيانات المستخدم بنجاح' };
    }
    
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم حذف المستخدم بنجاح' };
    }
    
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ TRANSACTIONS API ============
export interface Transaction {
  id: string;
  title: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  paymentMethod: string;
  createdAt: Date;
  completedAt?: Date;
  description: string;
  category: string;
  adminNotes?: string;
}

export const transactionsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Transaction[]>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || API_CONFIG.MOCK_CONFIG.DEFAULT_PAGE_SIZE;
      const status = params?.status;
      const search = params?.search || '';
      
      let filteredTransactions = mockTransactions;
      
      if (status && status !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === status);
      }
      
      if (search) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.buyerName.toLowerCase().includes(search.toLowerCase()) ||
          t.sellerName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: filteredTransactions.length,
          pages: Math.ceil(filteredTransactions.length / limit)
        }
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    return apiRequest(`/transactions?${queryParams.toString()}`);
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const transaction = mockTransactions.find(t => t.id === id);
      if (!transaction) {
        throw new Error('المعاملة غير موجودة');
      }
      
      return { success: true, data: transaction };
    }
    
    return apiRequest(`/transactions/${id}`);
  },

  update: async (id: string, data: { status: string; adminNotes?: string }): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم تحديث حالة المعاملة بنجاح' };
    }
    
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ ANALYTICS API ============
export interface DashboardStats {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyStats: Array<{
    month: string;
    transactions: number;
    revenue: number;
  }>;
}

export const analyticsAPI = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const totalTransactions = mockTransactions.length;
      const completedTransactions = mockTransactions.filter(t => t.status === 'completed').length;
      const pendingTransactions = mockTransactions.filter(t => t.status === 'pending').length;
      const totalUsers = mockUsers.length;
      const totalRevenue = mockTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Generate monthly stats for last 12 months
      const monthlyStats = [];
      const now = new Date();
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[monthDate.getMonth()];
        
        // Filter transactions for this month
        const monthTransactions = mockTransactions.filter(t => {
          const tDate = new Date(t.createdAt);
          return tDate.getMonth() === monthDate.getMonth() && 
                 tDate.getFullYear() === monthDate.getFullYear();
        });
        
        const monthRevenue = monthTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        monthlyStats.push({
          month: monthName,
          transactions: monthTransactions.length,
          revenue: monthRevenue
        });
      }
      
      return {
        success: true,
        data: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          totalUsers,
          totalRevenue,
          monthlyStats
        }
      };
    }
    
    return apiRequest('/analytics/dashboard');
  },
};

// ============ PAYMENT LINKS API ============
export interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  description: string;
  status: 'active' | 'expired' | 'used';
  expiresAt: Date;
  usedCount: number;
  maxUses?: number;
  createdAt: Date;
  createdBy: string;
}

export const paymentLinksAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaymentLink[]>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || API_CONFIG.MOCK_CONFIG.DEFAULT_PAGE_SIZE;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLinks = mockPaymentLinks.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedLinks,
        pagination: {
          page,
          limit,
          total: mockPaymentLinks.length,
          pages: Math.ceil(mockPaymentLinks.length / limit)
        }
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest(`/payment-links?${queryParams.toString()}`);
  },

  create: async (data: {
    title: string;
    amount: number;
    description: string;
    expiresAt: string;
  }): Promise<ApiResponse<PaymentLink>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم إنشاء رابط الدفع بنجاح' };
    }
    
    return apiRequest('/payment-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ SUPPORT API ============
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
  adminReply?: string;
  repliedAt?: Date;
  repliedBy?: string;
}

export const supportAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<SupportTicket[]>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || API_CONFIG.MOCK_CONFIG.DEFAULT_PAGE_SIZE;
      const status = params?.status;
      
      let filteredTickets = mockSupportTickets;
      
      if (status && status !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.status === status);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedTickets,
        pagination: {
          page,
          limit,
          total: filteredTickets.length,
          pages: Math.ceil(filteredTickets.length / limit)
        }
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/support?${queryParams.toString()}`);
  },

  update: async (id: string, data: { status: string; adminReply?: string }): Promise<ApiResponse> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return { success: true, message: 'تم تحديث تذكرة الدعم بنجاح' };
    }
    
    return apiRequest(`/support/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ WALLET API ============
export interface WalletTransaction {
  id: string;
  type: 'commission' | 'withdrawal' | 'refund' | 'fee';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
  bankAccount?: string;
  createdAt: Date;
}

export const walletAPI = {
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<WalletTransaction[]>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || API_CONFIG.MOCK_CONFIG.DEFAULT_PAGE_SIZE;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = mockWalletTransactions.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: mockWalletTransactions.length,
          pages: Math.ceil(mockWalletTransactions.length / limit)
        }
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest(`/wallet/transactions?${queryParams.toString()}`);
  },

  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      // Calculate balance from mock wallet transactions
      const balance = mockWalletTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { success: true, data: { balance } };
    }
    
    return apiRequest('/wallet/balance');
  },
};

// ============ EXPORT API ============
export const exportAPI = {
  exportData: async (type: 'users' | 'transactions' | 'payment-links' | 'support', format: 'json' | 'csv' = 'json'): Promise<any> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      
      let data: any[] = [];
      switch (type) {
        case 'users':
          data = mockUsers;
          break;
        case 'transactions':
          data = mockTransactions;
          break;
        case 'payment-links':
          data = mockPaymentLinks;
          break;
        case 'support':
          data = mockSupportTickets;
          break;
      }
      
      if (format === 'csv') {
        // Convert to CSV and download
        const headers = Object.keys(data[0] || {}).join(',');
        const csvData = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        ).join('\n');
        
        const blob = new Blob([headers + '\n' + csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true, message: 'تم تحميل الملف بنجاح' };
      } else {
        return { success: true, data, message: `تم تصدير ${data.length} سجل بنجاح` };
      }
    }

    const response = await fetch(`${API_CONFIG.API_BASE_URL}/export/${type}?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
    });

    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'تم تحميل الملف بنجاح' };
    } else {
      return await response.json();
    }
  },
};

// Health check
export const healthCheck = async (): Promise<ApiResponse> => {
  if (API_CONFIG.USE_MOCK_DATA) {
    await simulateApiDelay(100);
    return { 
      success: true, 
      message: 'Waset Misr API (Mock Mode) is running', 
      data: { mode: 'mock', timestamp: new Date().toISOString() }
    };
  }
  
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    throw new Error('لا يمكن الوصول إلى الخادم');
  }
};