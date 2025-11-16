import { useState, useEffect } from 'react';
import { Link2, ExternalLink, CheckCircle, Clock, XCircle, Power, PowerOff, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { firestorePaymentLinksService, type FirestorePaymentLink } from '../services/firestoreService';

const PaymentLinks = () => {
  const [links, setLinks] = useState<FirestorePaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (links.length > 0) {
      setStats({
        total: links.length,
        active: links.filter((l) => l.isActive).length,
        used: links.filter((l) => l.completedTransactions > 0).length,
        expired: links.filter((l) => !l.isActive && l.completedTransactions > 0).length,
      });
    }
  }, [links]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: log API config to help diagnose Firestore access problems
      console.log('[Admin] API_CONFIG:', API_CONFIG);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        const linksData = await firestorePaymentLinksService.getAll(1000); // جلب جميع روابط الدفع
        setLinks(linksData);
      } else {
        // Fallback to mock data
        const { mockPaymentLinks } = await import('../data/mockData');
        setLinks(mockPaymentLinks);
      }
    } catch (error) {
      console.error('خطأ في جلب روابط الدفع:', error);
      const message = (error as any)?.message || (error as any)?.code || 'فشل تحميل روابط الدفع';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    if (saving) return;
    
    try {
      setSaving(linkId);
      setError(null);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        await firestorePaymentLinksService.toggleActive(linkId, !currentStatus);
      }

      // تحديث UI
      setLinks(prevLinks =>
        prevLinks.map(l =>
          l.id === linkId
            ? { ...l, isActive: !currentStatus }
            : l
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث حالة الرابط:', error);
      setError('فشل تحديث حالة الرابط');
    } finally {
      setSaving(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'used':
        return <Clock size={18} className="text-blue-600" />;
      case 'expired':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (link: FirestorePaymentLink) => {
    if (link.isActive) {
      return 'bg-green-100 text-green-800';
    } else if (link.completedTransactions > 0) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (link: FirestorePaymentLink) => {
    if (link.isActive) {
      return 'نشط';
    } else if (link.completedTransactions > 0) {
      return 'مستخدم';
    } else {
      return 'غير نشط';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل روابط الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001731]">إدارة روابط الدفع</h1>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="text-[#001731]" size={20} />
            <p className="text-gray-600 text-sm">إجمالي الروابط</p>
          </div>
          <p className="text-2xl font-bold text-[#001731]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-gray-600 text-sm">روابط نشطة</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={20} />
            <p className="text-gray-600 text-sm">روابط مستخدمة</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-600" size={20} />
            <p className="text-gray-600 text-sm">روابط منتهية</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">العنوان</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{link.title}</p>
                      {link.description && (
                        <p className="text-sm text-gray-500">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{link.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#001731]">
                      {link.amount.toLocaleString('ar-EG')} جنيه
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {link.isActive ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : link.completedTransactions > 0 ? (
                        <Clock size={18} className="text-blue-600" />
                      ) : (
                        <XCircle size={18} className="text-red-600" />
                      )}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          link
                        )}`}
                      >
                        {getStatusLabel(link)}
                      </span>
                    </div>
                    {link.completedTransactions > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {link.completedTransactions} معاملة مكتملة
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(link.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {link.expiresAt && link.expiresAt instanceof Date
                      ? link.expiresAt.toLocaleDateString('ar-EG')
                      : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(link.id, link.isActive)}
                        disabled={saving === link.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          link.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={link.isActive ? 'تعطيل' : 'تفعيل'}
                      >
                        {saving === link.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : link.isActive ? (
                          <>
                            <PowerOff size={18} />
                            <span>تعطيل</span>
                          </>
                        ) : (
                          <>
                            <Power size={18} />
                            <span>تفعيل</span>
                          </>
                        )}
                      </button>
                    </div>
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

export default PaymentLinks;
