import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    commissionRate: 10,
    minCommission: 50,
    maxTransactionAmount: 1000000,
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Here you would save to Firebase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#001731]">الإعدادات العامة</h1>

      {/* Commission Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#001731] p-3 rounded-lg">
            <DollarSign className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-[#001731]">إعدادات العمولات والرسوم</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نسبة العمولة (%)
            </label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) =>
                setSettings({ ...settings, commissionRate: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
              min="0"
              max="100"
            />
            <p className="text-sm text-gray-500 mt-1">
              النسبة المئوية للعمولة على المعاملات
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحد الأدنى للعمولة (جنيه)
            </label>
            <input
              type="number"
              value={settings.minCommission}
              onChange={(e) =>
                setSettings({ ...settings, minCommission: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
              min="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              الحد الأدنى للعمولة للمعاملات الصغيرة
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحد الأقصى لمبلغ المعاملة (جنيه)
            </label>
            <input
              type="number"
              value={settings.maxTransactionAmount}
              onChange={(e) =>
                setSettings({ ...settings, maxTransactionAmount: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001731] focus:border-transparent outline-none"
              min="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              الحد الأقصى للمبلغ المسموح به في المعاملة الواحدة
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Bell className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-[#001731]">إعدادات الإشعارات</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">تفعيل الإشعارات</p>
              <p className="text-sm text-gray-500">تلقي إشعارات حول نشاط المنصة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, notificationsEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#001731]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-gray-500">إرسال إشعارات عبر البريد الإلكتروني</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#001731]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">إشعارات SMS</p>
              <p className="text-sm text-gray-500">إرسال إشعارات عبر الرسائل النصية</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, smsNotifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#001731]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500 p-3 rounded-lg">
            <Shield className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-[#001731]">إعدادات الأمان</h2>
        </div>

        <div className="space-y-4">
          <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            تغيير كلمة المرور
          </button>
          <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            تفعيل المصادقة الثنائية
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {saved && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <SettingsIcon size={18} />
            <span>تم حفظ الإعدادات بنجاح</span>
          </div>
        )}
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-[#001731] text-white rounded-lg hover:bg-[#002a52] font-medium"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
};

export default Settings;
