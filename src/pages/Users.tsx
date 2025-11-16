import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, User as UserIcon, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { firestoreUsersService, type FirestoreUser } from '../services/firestoreService';
import { firestoreWalletsService } from '../services/firestoreService';

const Users = () => {
  const [users, setUsers] = useState<(FirestoreUser & { isBlocked?: boolean; balance?: number })[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<(FirestoreUser & { isBlocked?: boolean; balance?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: surface API config to help diagnose Firestore connectivity issues
      console.log('[Admin] API_CONFIG:', API_CONFIG);
      
      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        const [usersData, walletsData] = await Promise.all([
          firestoreUsersService.getAll(1000), // جلب جميع المستخدمين
          firestoreWalletsService.getAll(1000), // جلب جميع المحافظ
        ]);

        // ربط المحافظ مع المستخدمين
        const usersWithWallets = usersData.map(user => {
          const wallet = walletsData.find(w => w.userId === user.id || w.id === user.id);
          return {
            ...user,
            balance: wallet?.balance || 0,
            isBlocked: (user as any).isBlocked || false,
          };
        });

        setUsers(usersWithWallets);
      } else {
        // Fallback to mock data
        const { mockUsers } = await import('../data/mockData');
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      // Show the underlying error message when available (helps debug permission/config issues)
      const message = (error as any)?.message || (error as any)?.code || 'فشل تحميل المستخدمين';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone || '').includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    if (saving) return;
    
    try {
      setSaving(userId);
      setError(null);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        if (isBlocked) {
          await firestoreUsersService.unblockUser(userId);
        } else {
          await firestoreUsersService.blockUser(userId);
        }
      }

      // تحديث UI
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId
            ? { ...u, isBlocked: !isBlocked }
            : u
        )
      );
    } catch (error) {
      console.error('خطأ في حظر/إلغاء حظر المستخدم:', error);
      setError('فشل تحديث حالة المستخدم');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#001731]">إدارة المستخدمين</h1>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none w-full sm:w-80"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">إجمالي المستخدمين</p>
          <p className="text-2xl font-bold text-[#001731]">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">مستخدمين نشطين</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => !u.isBlocked).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">مستخدمين محظورين</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.isBlocked).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">إجمالي الأرصدة</p>
          <p className="text-2xl font-bold text-[#001731]">
            {users.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString('ar-EG')} جنيه
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الهاتف</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المعاملات</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الرصيد</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#001731] flex items-center justify-center text-white font-bold">
                        {user.displayName?.[0]?.toUpperCase() || <UserIcon size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'غير محدد'}</p>
                        <p className="text-xs text-gray-500">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email || 'غير محدد'}</td>
                  <td className="px-6 py-4 text-gray-700">{user.phone || 'غير محدد'}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.transactionCount || 0}</p>
                    <p className="text-sm text-gray-500">
                      مكتمل: {user.transactionCount || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#001731]">
                      {(user.balance || 0).toLocaleString('ar-EG')} جنيه
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    {user.isBlocked ? (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        محظور
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        نشط
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleBlockUser(user.id, user.isBlocked || false)}
                      disabled={saving === user.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isBlocked
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {saving === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : user.isBlocked ? (
                        <>
                          <CheckCircle size={18} />
                          <span>إلغاء الحظر</span>
                        </>
                      ) : (
                        <>
                          <Ban size={18} />
                          <span>حظر</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">لا توجد مستخدمين مطابقين للبحث</p>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          عرض {filteredUsers.length} من أصل {users.length} مستخدم
        </p>
      </div>
    </div>
  );
};

export default Users;
