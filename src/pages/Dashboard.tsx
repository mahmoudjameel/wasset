import { useState, useEffect } from 'react';
import { analyticsAPI, transactionsAPI, DashboardStats } from '../services/api';
import { API_CONFIG } from '../config/api';
import { firestoreTransactionsService, firestoreUsersService } from '../services/firestoreService';
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Stats {
  totalTransactions: number;
  totalAmount: number;
  activeUsers: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalCommission: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    totalAmount: 0,
    activeUsers: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    totalCommission: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        // Use Firestore directly - جلب جميع البيانات
        const [transactions, users, completedTransactions] = await Promise.all([
          firestoreTransactionsService.getAll(1000), // جميع المعاملات
          firestoreUsersService.getAll(1000), // جميع المستخدمين
          firestoreTransactionsService.getByStatus('completed', 1000), // جميع المعاملات المكتملة
        ]);

        const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalCommission = totalRevenue * 0.02; // 2% commission
        const pendingTransactions = transactions.filter(t => t.status === 'pending');

        setStats({
          totalTransactions: transactions.length,
          totalAmount: totalRevenue,
          activeUsers: users.length,
          completedTransactions: completedTransactions.length,
          pendingTransactions: pendingTransactions.length,
          totalCommission,
        });

        // Generate monthly stats for chart
        const monthlyStats = [];
        const now = new Date();
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = months[monthDate.getMonth()];
          
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate.getMonth() === monthDate.getMonth() && 
                   tDate.getFullYear() === monthDate.getFullYear();
          });
          
          const monthRevenue = monthTransactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          
          monthlyStats.push({
            month: monthName,
            transactions: monthTransactions.length,
            revenue: monthRevenue
          });
        }
        
        setChartData(monthlyStats);
        setRecentTransactions(transactions.slice(0, 5));
      } else {
        // Use API service (Mock or REST API)
        const response = await analyticsAPI.getDashboardStats();
        
        if (response.success && response.data) {
          const { 
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            totalUsers,
            totalRevenue,
            monthlyStats
          } = response.data;

          setStats({
            totalTransactions,
            totalAmount: totalRevenue,
            activeUsers: totalUsers,
            completedTransactions,
            pendingTransactions,
            totalCommission: totalRevenue * 0.02 // 2% commission
          });

          setChartData(monthlyStats);
        }

        const transactionsResponse = await transactionsAPI.getAll({ limit: 5 });
        if (transactionsResponse.success && transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data);
        }
      }

    } catch (error) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المعاملات',
      value: stats.totalTransactions,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
      isPositive: true,
    },
    {
      title: 'إجمالي المبالغ',
      value: `${stats.totalAmount.toLocaleString('ar-EG')} جنيه`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%',
      isPositive: true,
    },
    {
      title: 'المستخدمين النشطين',
      value: stats.activeUsers,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%',
      isPositive: true,
    },
    {
      title: 'العمولات',
      value: `${stats.totalCommission.toLocaleString('ar-EG')} جنيه`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
      isPositive: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'escrow':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغاة';
      case 'escrow':
        return 'في الضمان';
      case 'accepted':
        return 'مقبولة';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    card.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{card.change}</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-[#001731]">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#001731] mb-6">حالة المعاملات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معاملات مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTransactions}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalTransactions > 0 
                    ? Math.round((stats.completedTransactions / stats.totalTransactions) * 100)
                    : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-yellow-600">
                  {stats.totalTransactions > 0 
                    ? Math.round((stats.pendingTransactions / stats.totalTransactions) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#001731] mb-6">النشاط الأخير</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.title}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.buyerName} → {transaction.sellerName}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#001731]">
                    {transaction.amount.toLocaleString('ar-EG')} جنيه
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#001731] mb-4">ملخص سريع</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-2">معاملات مكتملة</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedTransactions}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">معاملات قيد الانتظار</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">إجمالي العمولات</p>
            <p className="text-3xl font-bold text-[#001731]">
              {stats.totalCommission.toLocaleString('ar-EG')} جنيه
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
