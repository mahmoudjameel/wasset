import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { firestoreWalletsService, firestoreWalletService } from '../services/firestoreService';

const Wallet = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalAvailable: 0,
    totalHold: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (wallets.length > 0) {
      const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
      const totalAvailable = wallets.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
      const totalHold = wallets.reduce((sum, w) => sum + (w.holdBalance || 0), 0);
      
      setStats({
        totalBalance,
        totalAvailable,
        totalHold,
      });
    }
  }, [wallets]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: log API config to help diagnose Firestore access problems
      console.log('[Admin] API_CONFIG:', API_CONFIG);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        const [walletsData, transactionsData] = await Promise.all([
          firestoreWalletsService.getAll(1000), // جلب جميع المحافظ
          firestoreWalletService.getAllTransactions(1000), // جلب جميع معاملات المحفظة
        ]);
        
        setWallets(walletsData);
        setTransactions(transactionsData);
      } else {
        // Fallback to mock data
        const { mockWalletTransactions, mockWalletStats } = await import('../data/mockData');
        setTransactions(mockWalletTransactions);
        setStats(mockWalletStats);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      const message = (error as any)?.message || (error as any)?.code || 'فشل تحميل البيانات';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdrawal':
        return 'سحب';
      case 'escrow_hold':
        return 'حجز في الضمان';
      case 'escrow_release':
        return 'تحرير من الضمان';
      case 'commission':
        return 'عمولة';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return 'text-green-600';
      case 'withdrawal':
      case 'commission':
      case 'escrow_hold':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return <TrendingUp size={18} className="text-green-600" />;
      case 'withdrawal':
      case 'commission':
      case 'escrow_hold':
        return <TrendingDown size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-gray-600" />;
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
      <div>
        <h1 className="text-2xl font-bold text-[#001731]">إدارة المحفظة والدفعات</h1>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-[#001731]">
                {stats.totalBalance.toLocaleString('ar-EG')} جنيه
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">الأرصدة المتاحة</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalAvailable.toLocaleString('ar-EG')} جنيه
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">الأرصدة المحجوزة</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalHold.toLocaleString('ar-EG')} جنيه
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#001731]">المعاملات المالية الأخيرة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">النوع</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الوصف</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.slice(0, 50).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      <span className="font-medium text-gray-900">{getTypeLabel(tx.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-bold ${getTypeColor(tx.type)}`}>
                      {tx.amount.toLocaleString('ar-EG')} جنيه
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{tx.userId || 'غير محدد'}</p>
                    <p className="text-xs text-gray-500">{tx.type}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.status === 'completed'
                        ? 'مكتمل'
                        : tx.status === 'pending'
                        ? 'قيد الانتظار'
                        : 'فشل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
