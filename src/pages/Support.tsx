import { useState, useEffect } from 'react';
import { mockSupportTickets } from '../data/mockData';
import { MessageSquare, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { firestoreSupportService, type FirestoreSupportTicket } from '../services/firestoreService';

const Support = () => {
  const [tickets, setTickets] = useState<FirestoreSupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<FirestoreSupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        const data = await firestoreSupportService.getAll(1000);
        setTickets(data);
      } else {
        setTickets(mockSupportTickets as any);
      }
    } catch (error) {
      console.error('خطأ في جلب التذاكر:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      if (API_CONFIG.USE_FIRESTORE && !API_CONFIG.USE_MOCK_DATA) {
        await firestoreSupportService.updateStatus(ticketId, status);
      }

      setTickets(prevTickets =>
        prevTickets.map(t =>
          t.id === ticketId
            ? {
                ...t,
                status,
                updatedAt: new Date(),
                resolvedAt:
                  status === 'resolved' || status === 'closed'
                    ? new Date()
                    : t.resolvedAt,
              }
            : t
        )
      );
      setSelectedTicket(null);
    } catch (error) {
      console.error('خطأ في تحديث حالة التذكرة:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={18} className="text-yellow-600" />;
      case 'in_progress':
        return <Clock size={18} className="text-blue-600" />;
      case 'resolved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'closed':
        return <XCircle size={18} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوحة';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'محلولة';
      case 'closed':
        return 'مغلقة';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return priority;
    }
  };

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : tickets.filter((t) => t.status === statusFilter);

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التذاكر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#001731]">إدارة الدعم الفني</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
        >
          <option value="all">جميع الحالات</option>
          <option value="open">مفتوحة</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">محلولة</option>
          <option value="closed">مغلقة</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-gray-600 text-sm">مفتوحة</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={20} />
            <p className="text-gray-600 text-sm">قيد المعالجة</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-gray-600 text-sm">محلولة</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-gray-600" size={20} />
            <p className="text-gray-600 text-sm">مغلقة</p>
          </div>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الموضوع</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الأولوية</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{ticket.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{ticket.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.userName}</p>
                      <p className="text-sm text-gray-500">{ticket.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <MessageSquare size={18} />
                      <span>عرض</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">لا توجد تذاكر بهذه الحالة</p>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#001731] mb-6">تفاصيل التذكرة</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم التذكرة</p>
                <p className="font-medium text-lg">{selectedTicket.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الموضوع</p>
                <p className="font-medium text-lg">{selectedTicket.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الرسالة</p>
                <p className="text-gray-900">{selectedTicket.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المستخدم</p>
                  <p className="font-medium">{selectedTicket.userName}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الأولوية</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                  <p className="text-sm">{new Date(selectedTicket.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">آخر تحديث</p>
                  <p className="text-sm">{new Date(selectedTicket.updatedAt).toLocaleString('ar-EG')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">تحديث الحالة</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    قيد المعالجة
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    محلولة
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedTicket(null)}
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

export default Support;
