import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Extended mock data with 150+ records
const generateMockData = () => {
  const mockUsers = [];
  const mockTransactions = [];
  const mockPaymentLinks = [];
  const mockSupportTickets = [];
  const mockWalletTransactions = [];

  // Names for realistic Arabic data
  const arabicNames = [
    'أحمد محمد العلي', 'فاطمة سعد الغامدي', 'محمد عبدالله النصر', 'سارة أحمد القحطاني',
    'عبدالرحمن خالد المطيري', 'نورا فهد الدوسري', 'خالد عبدالعزيز الشمري', 'هناء محمد العتيبي',
    'سلطان ناصر القرني', 'زينب علي الزهراني', 'يوسف حمد البقمي', 'مريم أحمد الجهني',
    'عمر صالح الحربي', 'ريم عبدالله السبيعي', 'طارق محمد الأحمدي', 'لجين سامي العنزي',
    'فهد عبدالرحمن المالكي', 'أسماء محمد الرشيد', 'عادل أحمد الفيصل', 'ندى خالد العسيري'
  ];

  const companies = [
    'متجر التقنية المتطورة', 'الرياض للإلكترونيات', 'جدة التجارية', 'الدمام للأجهزة',
    'مكة الذكية', 'المدينة للهواتف', 'تبوك التقنية', 'الطائف الرقمية',
    'أبها للكمبيوتر', 'نجران للأجهزة', 'حائل التكنولوجيا', 'سكاكا الحديثة'
  ];

  const products = [
    'iPhone 15 Pro', 'سامسونج Galaxy S24', 'لابتوب HP', 'آيباد برو',
    'ساعة ذكية', 'سماعات AirPods', 'كاميرا كانون', 'PlayStation 5',
    'نينتندو سويتش', 'تلفزيون OLED', 'مكيف هواء', 'غسالة اتوماتيك',
    'ثلاجة ذكية', 'فرن كهربائي', 'مكنسة كهربائية', 'جهاز تنقية هواء'
  ];

  // Generate 100+ users
  for (let i = 1; i <= 100; i++) {
    const isCompany = i % 5 === 0; // Every 5th user is a company
    const createdDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    mockUsers.push({
      uid: `user_${String(i).padStart(3, '0')}`,
      displayName: isCompany ? companies[i % companies.length] : arabicNames[i % arabicNames.length],
      email: isCompany ? `contact${i}@${companies[i % companies.length].replace(/\s/g, '').toLowerCase()}.com` 
                       : `user${i}@example.com`,
      phone: `+9665${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      userType: isCompany ? 'seller' : (i % 3 === 0 ? 'seller' : 'buyer'),
      verificationStatus: Math.random() > 0.1 ? 'verified' : 'pending',
      registrationDate: createdDate,
      lastLoginDate: new Date(2024, 10, Math.floor(Math.random() * 3) + 1),
      transactionCount: Math.floor(Math.random() * 50),
      totalSpent: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : 0,
      totalEarned: Math.random() > 0.5 ? Math.floor(Math.random() * 8000) : 0,
      createdAt: createdDate,
      updatedAt: new Date()
    });
  }

  // Generate 60+ transactions
  const statuses = ['completed', 'pending', 'cancelled', 'disputed'];
  const statusWeights = [0.6, 0.25, 0.1, 0.05]; // 60% completed, 25% pending, etc.
  
  for (let i = 1; i <= 60; i++) {
    const createdDate = new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1);
    const buyer = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const seller = mockUsers.filter(u => u.userType === 'seller')[Math.floor(Math.random() * mockUsers.filter(u => u.userType === 'seller').length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    
    // Weighted random status selection
    let cumulativeWeight = 0;
    const randomValue = Math.random();
    let selectedStatus = statuses[0];
    
    for (let j = 0; j < statuses.length; j++) {
      cumulativeWeight += statusWeights[j];
      if (randomValue <= cumulativeWeight) {
        selectedStatus = statuses[j];
        break;
      }
    }

    mockTransactions.push({
      id: `txn_${String(i).padStart(3, '0')}`,
      title: `شراء ${product}`,
      buyerName: buyer.displayName,
      sellerName: seller.displayName,
      amount: amount,
      commission: amount * 0.02,
      status: selectedStatus,
      paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'bank_transfer',
      createdAt: createdDate,
      completedAt: selectedStatus === 'completed' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      description: `${product} - حالة ممتازة مع الضمان`,
      category: i % 4 === 0 ? 'إلكترونيات' : i % 4 === 1 ? 'أجهزة منزلية' : i % 4 === 2 ? 'إكسسوارات' : 'متنوعة',
      adminNotes: selectedStatus === 'disputed' ? 'تم فتح نزاع بخصوص جودة المنتج' : null
    });
  }

  // Generate 25+ payment links
  for (let i = 1; i <= 25; i++) {
    const createdDate = new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1);
    const expiresDate = new Date(createdDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 3000) + 50;
    
    mockPaymentLinks.push({
      id: `link_${String(i).padStart(3, '0')}`,
      title: `دفعة ${products[i % products.length]}`,
      amount: amount,
      description: `دفعة مستحقة لشراء ${products[i % products.length]}`,
      status: expiresDate > new Date() ? (Math.random() > 0.3 ? 'active' : 'used') : 'expired',
      expiresAt: expiresDate,
      usedCount: Math.floor(Math.random() * 3),
      maxUses: Math.floor(Math.random() * 5) + 1,
      createdAt: createdDate,
      createdBy: 'admin_001'
    });
  }

  // Generate 35+ support tickets
  const ticketCategories = ['payment', 'technical', 'account', 'dispute', 'general'];
  const ticketStatuses = ['new', 'in_progress', 'completed', 'closed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (let i = 1; i <= 35; i++) {
    const createdDate = new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1);
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const category = ticketCategories[Math.floor(Math.random() * ticketCategories.length)];
    const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)];
    
    mockSupportTickets.push({
      id: `ticket_${String(i).padStart(3, '0')}`,
      title: `${category === 'payment' ? 'مشكلة في الدفع' : 
               category === 'technical' ? 'مشكلة تقنية' :
               category === 'account' ? 'مشكلة في الحساب' :
               category === 'dispute' ? 'نزاع تجاري' : 'استفسار عام'}`,
      description: `${category === 'payment' ? 'لا أستطيع إكمال عملية الدفع' :
                    category === 'technical' ? 'التطبيق لا يعمل بشكل صحيح' :
                    category === 'account' ? 'لا أستطيع تسجيل الدخول' :
                    category === 'dispute' ? 'المنتج لا يطابق الوصف' :
                    'أحتاج مساعدة في استخدام التطبيق'}`,
      status: status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: category,
      userEmail: user.email,
      userName: user.displayName,
      createdAt: createdDate,
      adminReply: status === 'completed' || status === 'closed' ? 'تم حل المشكلة بنجاح' : null,
      repliedAt: status === 'completed' || status === 'closed' ? new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
      repliedBy: status === 'completed' || status === 'closed' ? 'admin_001' : null
    });
  }

  // Generate 80+ wallet transactions
  const walletTypes = ['commission', 'withdrawal', 'refund', 'fee'];
  
  for (let i = 1; i <= 80; i++) {
    const createdDate = new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1);
    const type = walletTypes[Math.floor(Math.random() * walletTypes.length)];
    const amount = type === 'withdrawal' ? -(Math.floor(Math.random() * 2000) + 100) :
                   type === 'fee' ? -(Math.floor(Math.random() * 50) + 5) :
                   Math.floor(Math.random() * 500) + 10;
    
    mockWalletTransactions.push({
      id: `wallet_${String(i).padStart(3, '0')}`,
      type: type,
      amount: amount,
      description: type === 'commission' ? `عمولة من معاملة #txn_${String(Math.floor(Math.random() * 60) + 1).padStart(3, '0')}` :
                   type === 'withdrawal' ? `سحب إلى البنك الأهلي` :
                   type === 'refund' ? `رد مبلغ معاملة ملغية` :
                   `رسوم خدمة`,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      transactionId: type === 'commission' ? `txn_${String(Math.floor(Math.random() * 60) + 1).padStart(3, '0')}` : null,
      bankAccount: type === 'withdrawal' ? `****${Math.floor(Math.random() * 9000) + 1000}` : null,
      createdAt: createdDate
    });
  }

  return {
    mockUsers,
    mockTransactions,
    mockPaymentLinks,
    mockSupportTickets,
    mockWalletTransactions
  };
};

export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 بدء ملء قاعدة البيانات بالبيانات الشاملة...');

    const {
      mockUsers,
      mockTransactions,
      mockPaymentLinks,
      mockSupportTickets,
      mockWalletTransactions
    } = generateMockData();

    // Add admin user
    await db.collection('admins').doc('admin_001').set({
      uid: 'admin_001',
      displayName: 'مسؤول النظام الرئيسي',
      email: 'admin@wasetmisr.com',
      role: 'super_admin',
      permissions: ['read', 'write', 'delete', 'export'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ تم إضافة حساب المسؤول');

    // Add users in batches (Firestore batch limit is 500)
    const userBatches = [];
    for (let i = 0; i < mockUsers.length; i += 400) {
      userBatches.push(mockUsers.slice(i, i + 400));
    }

    for (let batchIndex = 0; batchIndex < userBatches.length; batchIndex++) {
      const batch = db.batch();
      userBatches[batchIndex].forEach((user, index) => {
        const globalIndex = batchIndex * 400 + index;
        const docRef = db.collection('users').doc(`user_${String(globalIndex + 1).padStart(3, '0')}`);
        batch.set(docRef, {
          ...user,
          createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt),
          registrationDate: admin.firestore.Timestamp.fromDate(user.registrationDate),
          lastLoginDate: admin.firestore.Timestamp.fromDate(user.lastLoginDate)
        });
      });
      await batch.commit();
    }
    console.log(`✅ تم إضافة ${mockUsers.length} مستخدم`);

    // Add transactions
    const transactionBatch = db.batch();
    mockTransactions.forEach((transaction, index) => {
      const docRef = db.collection('transactions').doc(`txn_${String(index + 1).padStart(3, '0')}`);
      transactionBatch.set(docRef, {
        ...transaction,
        createdAt: admin.firestore.Timestamp.fromDate(transaction.createdAt),
        completedAt: transaction.completedAt ? admin.firestore.Timestamp.fromDate(transaction.completedAt) : null
      });
    });
    await transactionBatch.commit();
    console.log(`✅ تم إضافة ${mockTransactions.length} معاملة`);

    // Add payment links
    const paymentLinksBatch = db.batch();
    mockPaymentLinks.forEach((link, index) => {
      const docRef = db.collection('payment_links').doc(`link_${String(index + 1).padStart(3, '0')}`);
      paymentLinksBatch.set(docRef, {
        ...link,
        createdAt: admin.firestore.Timestamp.fromDate(link.createdAt),
        expiresAt: admin.firestore.Timestamp.fromDate(link.expiresAt)
      });
    });
    await paymentLinksBatch.commit();
    console.log(`✅ تم إضافة ${mockPaymentLinks.length} رابط دفع`);

    // Add support tickets
    const supportBatch = db.batch();
    mockSupportTickets.forEach((ticket, index) => {
      const docRef = db.collection('support_tickets').doc(`ticket_${String(index + 1).padStart(3, '0')}`);
      supportBatch.set(docRef, {
        ...ticket,
        createdAt: admin.firestore.Timestamp.fromDate(ticket.createdAt),
        repliedAt: ticket.repliedAt ? admin.firestore.Timestamp.fromDate(ticket.repliedAt) : null
      });
    });
    await supportBatch.commit();
    console.log(`✅ تم إضافة ${mockSupportTickets.length} تذكرة دعم`);

    // Add wallet transactions
    const walletBatch = db.batch();
    mockWalletTransactions.forEach((transaction, index) => {
      const docRef = db.collection('wallet_transactions').doc(`wallet_${String(index + 1).padStart(3, '0')}`);
      walletBatch.set(docRef, {
        ...transaction,
        createdAt: admin.firestore.Timestamp.fromDate(transaction.createdAt)
      });
    });
    await walletBatch.commit();
    console.log(`✅ تم إضافة ${mockWalletTransactions.length} معاملة محفظة`);

    // Calculate total wallet balance from transactions
    const totalCommission = mockWalletTransactions
      .filter(t => t.type === 'commission' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = Math.abs(mockWalletTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0));
    const walletBalance = totalCommission - totalWithdrawals;

    // Add main wallet
    await db.collection('wallets').doc('main').set({
      balance: walletBalance,
      currency: 'SAR',
      totalCommission,
      totalWithdrawals,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ تم إضافة المحفظة الرئيسية (الرصيد: ${walletBalance.toFixed(2)} ريال)`);

    // Add comprehensive settings
    await db.collection('settings').doc('general').set({
      appName: 'وسيط مصر - Admin Dashboard',
      version: '1.0.0',
      commissionRate: 0.02, // 2%
      minTransactionAmount: 10.00,
      maxTransactionAmount: 50000.00,
      supportEmail: 'support@wasetmisr.com',
      supportPhone: '+966500000000',
      workingHours: 'الأحد - الخميس: 9:00 ص - 6:00 م',
      supportLanguages: ['العربية', 'English'],
      maintenanceMode: false,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ تم إضافة الإعدادات العامة');

    // Add system log entry
    await db.collection('logs').add({
      action: 'database_seeded',
      description: 'تم ملء قاعدة البيانات بالبيانات الوهمية الشاملة',
      userId: 'system',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        usersCount: mockUsers.length,
        transactionsCount: mockTransactions.length,
        paymentLinksCount: mockPaymentLinks.length,
        supportTicketsCount: mockSupportTickets.length,
        walletTransactionsCount: mockWalletTransactions.length
      }
    });

    const totalRecords = mockUsers.length + mockTransactions.length + mockPaymentLinks.length + 
                        mockSupportTickets.length + mockWalletTransactions.length;

    console.log('🎉 تم ملء قاعدة البيانات بنجاح!');
    console.log(`📊 إجمالي السجلات: ${totalRecords}`);
    console.log(`👥 المستخدمون: ${mockUsers.length}`);
    console.log(`💰 المعاملات: ${mockTransactions.length}`);
    console.log(`🔗 روابط الدفع: ${mockPaymentLinks.length}`);
    console.log(`🎫 تذاكر الدعم: ${mockSupportTickets.length}`);
    console.log(`💳 معاملات المحفظة: ${mockWalletTransactions.length}`);
    
  } catch (error) {
    console.error('❌ خطأ في ملء قاعدة البيانات:', error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ تم الانتهاء من ملء قاعدة البيانات');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل في ملء قاعدة البيانات:', error);
      process.exit(1);
    });
}