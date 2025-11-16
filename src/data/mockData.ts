// بيانات وهمية شاملة لتطبيق وسيط مصر

// أسماء عربية واقعية
const arabicNames = [
  'أحمد محمد علي', 'فاطمة حسن إبراهيم', 'محمود عبدالله', 'سارة أحمد', 'خالد يوسف',
  'نور الدين', 'ليلى عمر', 'عمر سعيد', 'مريم عبدالرحمن', 'يوسف محمود',
  'هدى خالد', 'علي حسن', 'سلمى محمد', 'كريم عبدالله', 'رنا يوسف',
  'طارق إبراهيم', 'دينا سعيد', 'وائل محمد', 'نادية علي', 'حسام حسن',
  'ياسمين أحمد', 'بلال عمر', 'هناء محمود', 'سامي عبدالله', 'لبنى خالد',
  'ماجد يوسف', 'ريم حسن', 'عبدالرحمن أحمد', 'منى سعيد', 'فهد محمد',
  'شهد علي', 'زيد إبراهيم', 'سلوى عمر', 'راشد حسن', 'بشرى أحمد',
  'سعد محمود', 'أمل يوسف', 'ماهر خالد', 'رشا عبدالله', 'فيصل سعيد',
  'نسرين محمد', 'طلال علي', 'جميلة حسن', 'عادل إبراهيم', 'سامية عمر',
  'نبيل أحمد', 'رباب محمود', 'غسان يوسف', 'سعاد خالد', 'جمال عبدالله'
];

// منتجات وخدمات عربية
const products = [
  'هاتف آيفون 14 برو', 'لابتوب HP', 'سيارة تويوتا كامري', 'شقة في الرياض',
  'أثاث منزلي كامل', 'كاميرا كانون', 'ساعة رولكس', 'دراجة نارية ياماها',
  'معدات رياضية', 'جهاز بلايستيشن 5', 'تلفزيون سامسونج', 'ثلاجة ال جي',
  'غسالة بوش', 'مكيف سبليت', 'طابعة ليزر', 'خدمات تصميم جرافيك',
  'دورة تدريبية', 'استشارات قانونية', 'خدمات سباكة', 'أعمال صيانة',
  'قطع غيار سيارات', 'أجهزة كهربائية', 'ملابس رجالية', 'ملابس نسائية',
  'مجوهرات ذهبية', 'عطور فرنسية', 'أحذية رياضية', 'حقائب جلدية',
  'نظارات شمسية', 'ساعات ذكية', 'سماعات لاسلكية', 'شاشة كمبيوتر',
  'كيبورد ميكانيكي', 'ماوس جيمنج', 'كرسي مكتبي', 'مكتب خشبي',
  'مكتبة كتب', 'لوحة فنية', 'سجاد فارسي', 'مرآة حائط',
  'مصابيح ديكور', 'ستائر فخمة', 'وسائد مريحة', 'مفروشات فاخرة',
  'أدوات مطبخ', 'أواني طبخ', 'مجموعة أكواب', 'سكاكين احترافية',
  'خلاط كهربائي', 'ماكينة قهوة', 'فرن كهربائي', 'شواية منزلية'
];

// توليد تاريخ عشوائي خلال السنتين الماضيتين
const getRandomDate = (daysAgo: number = 730) => {
  const now = new Date('2025-11-03');
  const randomDays = Math.floor(Math.random() * daysAgo);
  return new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
};

// توليد رقم هاتف سعودي
const generatePhone = () => {
  const prefix = ['050', '053', '054', '055', '056', '058', '059'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${randomPrefix}${randomNumber}`;
};

// توليد بريد إلكتروني
const generateEmail = (name: string) => {
  const cleanName = name.split(' ')[0].toLowerCase();
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${domain}`;
};

// توليد معاملات وهمية
export const generateTransactions = (count: number = 60) => {
  const statuses = ['completed', 'pending', 'cancelled', 'escrow', 'accepted'];
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const buyer = arabicNames[Math.floor(Math.random() * arabicNames.length)];
    const seller = arabicNames[Math.floor(Math.random() * arabicNames.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const amount = Math.floor(Math.random() * 49000) + 1000;
    const commission = Math.floor(amount * 0.1);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = getRandomDate();

    transactions.push({
      id: `TX${String(i + 1).padStart(6, '0')}`,
      title: product,
      description: `معاملة شراء ${product} بين ${buyer} و ${seller}`,
      amount,
      commission,
      status,
      buyerName: buyer,
      buyerEmail: generateEmail(buyer),
      sellerName: seller,
      sellerEmail: generateEmail(seller),
      createdAt,
      updatedAt: new Date(createdAt.getTime() + (Math.random() * 86400000)),
    });
  }

  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// توليد مستخدمين وهميين
export const generateUsers = (count: number = 120) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const name = arabicNames[Math.floor(Math.random() * arabicNames.length)];
    const email = generateEmail(name);
    const phone = generatePhone();
    const totalTransactions = Math.floor(Math.random() * 30);
    const completedTransactions = Math.floor(totalTransactions * 0.7);
    const balance = Math.floor(Math.random() * 50000);
    const isBlocked = Math.random() < 0.05;
    const createdAt = getRandomDate(700);

    users.push({
      id: `USR${String(i + 1).padStart(6, '0')}`,
      displayName: name,
      email,
      phoneNumber: phone,
      totalTransactions,
      completedTransactions,
      balance,
      isBlocked,
      createdAt,
      rating: (Math.random() * 2 + 3).toFixed(1),
    });
  }

  return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// توليد معاملات المحفظة
export const generateWalletTransactions = (count: number = 80) => {
  const types = ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'commission'];
  const statuses = ['completed', 'pending', 'failed'];
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 20000) + 100;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = getRandomDate();
    const userName = arabicNames[Math.floor(Math.random() * arabicNames.length)];

    let description = '';
    switch (type) {
      case 'deposit':
        description = `إيداع من ${userName}`;
        break;
      case 'withdrawal':
        description = `سحب إلى ${userName}`;
        break;
      case 'escrow_hold':
        description = `حجز مبلغ في الضمان لمعاملة`;
        break;
      case 'escrow_release':
        description = `تحرير مبلغ من الضمان`;
        break;
      case 'commission':
        description = `عمولة من معاملة`;
        break;
    }

    transactions.push({
      id: `WT${String(i + 1).padStart(6, '0')}`,
      type,
      amount,
      description,
      status,
      userId: `USR${String(Math.floor(Math.random() * 120) + 1).padStart(6, '0')}`,
      userName,
      createdAt,
    });
  }

  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// توليد روابط الدفع
export const generatePaymentLinks = (count: number = 30) => {
  const statuses = ['active', 'used', 'expired'];
  const links = [];

  for (let i = 0; i < count; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const amount = Math.floor(Math.random() * 30000) + 500;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = getRandomDate(500);
    const expiresAt = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000));
    const usedAt = status === 'used' ? new Date(createdAt.getTime() + (Math.random() * 20 * 24 * 60 * 60 * 1000)) : null;

    links.push({
      id: `PL${String(i + 1).padStart(6, '0')}`,
      title: `رابط دفع - ${product}`,
      description: `رابط دفع لشراء ${product}`,
      amount,
      status,
      url: `https://waset-misr.com/pay/PL${String(i + 1).padStart(6, '0')}`,
      createdAt,
      expiresAt,
      usedAt,
    });
  }

  return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// توليد تذاكر الدعم
export const generateSupportTickets = (count: number = 40) => {
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  const priorities = ['high', 'medium', 'low'];
  const subjects = [
    'مشكلة في عملية الدفع',
    'استفسار عن رسوم المعاملة',
    'طلب استرداد مبلغ',
    'مشكلة في تسجيل الدخول',
    'تحديث بيانات الحساب',
    'شكوى على معاملة',
    'طلب توضيح',
    'مشكلة تقنية في التطبيق',
    'استفسار عن حالة المعاملة',
    'طلب دعم فني',
    'مشكلة في السحب',
    'استفسار عن رابط الدفع',
    'تفعيل الحساب',
    'تغيير رقم الهاتف',
    'طلب كشف حساب'
  ];

  const messages = [
    'أواجه مشكلة في إتمام عملية الدفع، يرجى المساعدة',
    'أريد الاستفسار عن كيفية حساب رسوم المعاملة',
    'تم خصم مبلغ من حسابي دون إتمام المعاملة، أرجو المساعدة',
    'لا أستطيع تسجيل الدخول إلى حسابي',
    'أحتاج إلى تحديث بياناتي الشخصية',
    'لدي شكوى بخصوص معاملة لم تكتمل',
    'أرجو توضيح خطوات إنشاء رابط دفع',
    'التطبيق لا يعمل بشكل صحيح على جهازي',
    'متى سيتم إتمام معاملتي رقم TX123456؟',
    'أحتاج مساعدة في استخدام التطبيق',
    'مشكلة في سحب الأموال من المحفظة',
    'كيف يمكنني مشاركة رابط الدفع؟',
    'حسابي غير مفعل، كيف أفعله؟',
    'أريد تغيير رقم هاتفي المسجل',
    'أحتاج كشف حساب تفصيلي'
  ];

  const tickets = [];

  for (let i = 0; i < count; i++) {
    const userName = arabicNames[Math.floor(Math.random() * arabicNames.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = getRandomDate(200);
    const updatedAt = new Date(createdAt.getTime() + (Math.random() * 10 * 24 * 60 * 60 * 1000));
    const resolvedAt = (status === 'resolved' || status === 'closed') ? updatedAt : null;

    tickets.push({
      id: `TK${String(i + 1).padStart(6, '0')}`,
      subject,
      message,
      userName,
      userEmail: generateEmail(userName),
      priority,
      status,
      createdAt,
      updatedAt,
      resolvedAt,
    });
  }

  return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// بيانات وهمية أولية
export const mockTransactions = generateTransactions();
export const mockUsers = generateUsers();
export const mockWalletTransactions = generateWalletTransactions();
export const mockPaymentLinks = generatePaymentLinks();
export const mockSupportTickets = generateSupportTickets();

// إحصائيات المحفظة
export const mockWalletStats = {
  totalBalance: mockWalletTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      if (t.type === 'deposit' || t.type === 'escrow_release') return sum + t.amount;
      if (t.type === 'withdrawal' || t.type === 'commission' || t.type === 'escrow_hold') return sum - t.amount;
      return sum;
    }, 0),
  totalHold: mockWalletTransactions
    .filter(t => t.type === 'escrow_hold' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0),
  totalAvailable: 0, // سيتم حسابه في الصفحة
};

mockWalletStats.totalAvailable = mockWalletStats.totalBalance - mockWalletStats.totalHold;
