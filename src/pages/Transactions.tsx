import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { firestoreTransactionsService, type FirestoreTransaction } from '../services/firestoreService';

const Transactions = () => {
  const [transactions, setTransactions] = useState<FirestoreTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FirestoreTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FirestoreTransaction | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: log API config to help diagnose Firestore access problems
      console.log('[Admin] API_CONFIG:', API_CONFIG);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        const transactionsData = await firestoreTransactionsService.getAll(1000); // جلب جميع المعاملات
        setTransactions(transactionsData);
      } else {
        // Fallback to mock data
        const { mockTransactions } = await import('../data/mockData');
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('خطأ في جلب المعاملات:', error);
      const message = (error as any)?.message || (error as any)?.code || 'فشل تحميل المعاملات';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleApprove = async (transactionId: string) => {
    if (saving) return;
    
    try {
      setSaving(transactionId);
      setError(null);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        await firestoreTransactionsService.updateStatus(transactionId, 'accepted');
      }

      // تحديث UI
      setTransactions(prevTransactions =>
        prevTransactions.map(t =>
          t.id === transactionId
            ? { ...t, status: 'accepted' }
            : t
        )
      );
      
      if (selectedTransaction?.id === transactionId) {
        setSelectedTransaction({ ...selectedTransaction, status: 'accepted' });
      }
    } catch (error) {
      console.error('خطأ في الموافقة على المعاملة:', error);
      setError('فشل تحديث حالة المعاملة');
    } finally {
      setSaving(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (saving) return;
    
    try {
      setSaving(transactionId);
      setError(null);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        await firestoreTransactionsService.updateStatus(transactionId, 'cancelled');
      }

      // تحديث UI
      setTransactions(prevTransactions =>
        prevTransactions.map(t =>
          t.id === transactionId
            ? { ...t, status: 'cancelled' }
            : t
        )
      );
      
      if (selectedTransaction?.id === transactionId) {
        setSelectedTransaction({ ...selectedTransaction, status: 'cancelled' });
      }
    } catch (error) {
      console.error('خطأ في رفض المعاملة:', error);
      setError('فشل تحديث حالة المعاملة');
    } finally {
      setSaving(null);
    }
  };

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
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
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
          <p className="text-gray-600">جاري تحميل المعاملات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#001731]">إدارة المعاملات</h1>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث عن معاملة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="accepted">مقبولة</option>
            <option value="escrow">في الضمان</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">إجمالي المعاملات</p>
          <p className="text-2xl font-bold text-[#001731]">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">قيد الانتظار</p>
          <p className="text-2xl font-bold text-yellow-600">
            {transactions.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">مكتملة</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter((t) => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">ملغاة</p>
          <p className="text-2xl font-bold text-red-600">
            {transactions.filter((t) => t.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المعاملة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المشتري</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">البائع</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.title}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.buyerName || 'غير محدد'}</p>
                      <p className="text-sm text-gray-500">{transaction.buyerEmail || transaction.buyerId || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.sellerName || 'غير محدد'}</p>
                      <p className="text-sm text-gray-500">{transaction.sellerEmail || transaction.sellerId || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#001731]">
                      {transaction.amount.toLocaleString('ar-EG')} جنيه
                    </p>
                    <p className="text-sm text-gray-500">
                      عمولة: {transaction.commission.toLocaleString('ar-EG')} جنيه
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="عرض التفاصيل"
                      >
                        <Eye size={18} />
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(transaction.id)}
                            disabled={saving === transaction.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="الموافقة"
                          >
                            {saving === transaction.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(transaction.id)}
                            disabled={saving === transaction.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="الرفض"
                          >
                            {saving === transaction.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <XCircle size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد معاملات مطابقة للبحث</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#001731] mb-6">تفاصيل المعاملة</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم المعاملة</p>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الحالة</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedTransaction.status
                    )}`}
                  >
                    {getStatusLabel(selectedTransaction.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">العنوان</p>
                  <p className="font-medium">{selectedTransaction.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المبلغ</p>
                  <p className="font-bold text-[#001731]">
                    {selectedTransaction.amount.toLocaleString('ar-EG')} جنيه
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">العمولة</p>
                  <p className="font-medium">{selectedTransaction.commission.toLocaleString('ar-EG')} جنيه</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                  <p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المشتري</p>
                  <p className="font-medium">{selectedTransaction.buyerName}</p>
                  <p className="text-sm text-gray-500">{selectedTransaction.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">البائع</p>
                  <p className="font-medium">{selectedTransaction.sellerName}</p>
                  <p className="text-sm text-gray-500">{selectedTransaction.sellerEmail}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الوصف</p>
                <p className="text-gray-900">{selectedTransaction.description}</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
