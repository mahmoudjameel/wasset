import { useState, useEffect } from 'react';
import { ArrowLeftRight, DollarSign, CreditCard, Star, CheckSquare, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getFeatureFlags, updateFeatureFlags, type FeatureFlags } from '../services/featureFlags';

interface FeatureFlagItem {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const FEATURE_FLAG_ITEMS: FeatureFlagItem[] = [
  {
    key: 'financialFeaturesEnabled',
    label: 'تفعيل جميع الميزات المالية',
    description: 'تفعيل/إخفاء جميع الميزات المالية في التطبيق دفعة واحدة',
    icon: DollarSign,
  },
  {
    key: 'transactionsEnabled',
    label: 'المعاملات المالية',
    description: 'السماح بإرسال واستقبال المعاملات المالية (لنا/لكم)',
    icon: ArrowLeftRight,
  },
  {
    key: 'walletEnabled',
    label: 'المحفظة',
    description: 'عرض رصيد المحفظة والتسويات في التطبيق',
    icon: CreditCard,
  },
  {
    key: 'subscriptionsEnabled',
    label: 'الاشتراكات',
    description: 'عرض شاشة الاشتراكات والخطط في التطبيق',
    icon: Star,
  },
  {
    key: 'matchesEnabled',
    label: 'المطابقات',
    description: 'عرض شاشة المطابقات والتسويات المالية',
    icon: CheckSquare,
  },
  {
    key: 'trialBannerEnabled',
    label: 'إعلان الاشتراك',
    description: 'عرض إعلان الاشتراك في الشاشة الرئيسية',
    icon: MessageSquare,
  },
];

const FeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const data = await getFeatureFlags();
      setFlags(data);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      setSaveStatus({ type: 'error', message: 'فشل تحميل البيانات' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof FeatureFlags) => {
    if (!flags || saving) return;

    const newValue = !flags[key];
    const updatedFlags = { ...flags, [key]: newValue };

    setFlags(updatedFlags);
    setSaving(true);
    setSaveStatus(null);

    try {
      await updateFeatureFlags({ [key]: newValue });
      setSaveStatus({ type: 'success', message: `تم ${newValue ? 'تفعيل' : 'إخفاء'} الميزة بنجاح` });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      setFlags(flags);
      setSaveStatus({ type: 'error', message: 'فشل تحديث الإعداد' });
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!flags) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="text-red-500 mx-auto mb-2" size={48} />
        <p className="text-red-700">فشل تحميل البيانات</p>
        <button
          onClick={loadFeatureFlags}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#001731]">إعدادات الميزات</h1>
          <p className="text-sm text-gray-500 mt-1">
            التحكم في إظهار/إخفاء الميزات المالية في التطبيق
          </p>
        </div>
        {saveStatus && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              saveStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {saveStatus.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-900">تنبيه مهم</p>
            <p className="text-sm text-yellow-700 mt-1">
              عند إخفاء الميزات المالية، لن يتمكن المستخدمون من رؤية أو استخدام هذه الميزات في التطبيق.
              التغييرات تطبق فوراً على جميع المستخدمين.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {FEATURE_FLAG_ITEMS.map((item) => {
          const Icon = item.icon;
          const isEnabled = flags[item.key] || false;

          return (
            <div
              key={item.key}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg ${
                      isEnabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={isEnabled ? 'text-green-600' : 'text-gray-400'}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#001731] mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggle(item.key)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#001731] disabled:opacity-50 disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">معلومات إضافية</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• التغييرات تطبق فوراً على جميع المستخدمين</li>
          <li>• لا حاجة لإعادة رفع التطبيق على المتاجر</li>
          <li>• البيانات يتم حفظها في Firestore تلقائياً</li>
          <li>• يمكن إعادة تفعيل الميزات في أي وقت</li>
        </ul>
      </div>
    </div>
  );
};

export default FeatureFlags;
