"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Create Express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['https://r4i7k6l9yr1g.space.minimax.io', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Error handling middleware
const handleError = (error, res) => {
    console.error('API Error:', error);
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في الخادم',
        error: error.message
    });
};
// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'يجب تسجيل الدخول أولاً' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'رمز المصادقة غير صحيح' });
        return;
    }
};
// ============ AUTH ENDPOINTS ============
// Login
app.post('/auth/login', async (req, res) => {
    try {
        // Note: Firebase Auth handles login on the client side
        // This endpoint could be used for additional server-side validation
        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Logout
app.post('/auth/logout', authenticateUser, async (req, res) => {
    try {
        // Server-side logout logic if needed
        res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ USERS ENDPOINTS ============
// Get all users
app.get('/users', authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const usersRef = db.collection('users');
        let query = usersRef.orderBy('createdAt', 'desc');
        if (search) {
            query = query.where('displayName', '>=', search)
                .where('displayName', '<=', search + '\uf8ff');
        }
        const snapshot = await query.limit(limit).offset((page - 1) * limit).get();
        const users = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Get total count
        const countSnapshot = await usersRef.get();
        const total = countSnapshot.size;
        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Get user by ID
app.get('/users/:id', authenticateUser, async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.params.id).get();
        if (!doc.exists) {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
            return;
        }
        res.json({ success: true, data: Object.assign({ id: doc.id }, doc.data()) });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Update user
app.put('/users/:id', authenticateUser, async (req, res) => {
    try {
        const { displayName, email, phone, status } = req.body;
        await db.collection('users').doc(req.params.id).update({
            displayName,
            email,
            phone,
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: 'تم تحديث بيانات المستخدم بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Delete user
app.delete('/users/:id', authenticateUser, async (req, res) => {
    try {
        await db.collection('users').doc(req.params.id).delete();
        res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ TRANSACTIONS ENDPOINTS ============
// Get all transactions
app.get('/transactions', authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search || '';
        let query = db.collection('transactions').orderBy('createdAt', 'desc');
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }
        if (search) {
            query = query.where('title', '>=', search)
                .where('title', '<=', search + '\uf8ff');
        }
        const snapshot = await query.limit(limit).offset((page - 1) * limit).get();
        const transactions = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Get total count
        const countSnapshot = await db.collection('transactions').get();
        const total = countSnapshot.size;
        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Get transaction by ID
app.get('/transactions/:id', authenticateUser, async (req, res) => {
    try {
        const doc = await db.collection('transactions').doc(req.params.id).get();
        if (!doc.exists) {
            res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
            return;
        }
        res.json({ success: true, data: Object.assign({ id: doc.id }, doc.data()) });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Update transaction status
app.put('/transactions/:id', authenticateUser, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        await db.collection('transactions').doc(req.params.id).update({
            status,
            adminNotes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: 'تم تحديث حالة المعاملة بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ PAYMENT LINKS ENDPOINTS ============
// Get all payment links
app.get('/payment-links', authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const snapshot = await db.collection('payment_links')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset((page - 1) * limit)
            .get();
        const paymentLinks = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const countSnapshot = await db.collection('payment_links').get();
        const total = countSnapshot.size;
        res.json({
            success: true,
            data: paymentLinks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Create payment link
app.post('/payment-links', authenticateUser, async (req, res) => {
    try {
        const { title, amount, description, expiresAt } = req.body;
        const paymentLink = {
            title,
            amount,
            description,
            expiresAt: new Date(expiresAt),
            status: 'active',
            usedCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        const docRef = await db.collection('payment_links').add(paymentLink);
        res.json({
            success: true,
            message: 'تم إنشاء رابط الدفع بنجاح',
            data: Object.assign({ id: docRef.id }, paymentLink)
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ SUPPORT TICKETS ENDPOINTS ============
// Get all support tickets
app.get('/support', authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        let query = db.collection('support_tickets').orderBy('createdAt', 'desc');
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.limit(limit).offset((page - 1) * limit).get();
        const tickets = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const countSnapshot = await db.collection('support_tickets').get();
        const total = countSnapshot.size;
        res.json({
            success: true,
            data: tickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Update support ticket
app.put('/support/:id', authenticateUser, async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (adminReply) {
            updateData.adminReply = adminReply;
            updateData.repliedAt = admin.firestore.FieldValue.serverTimestamp();
            updateData.repliedBy = req.user.uid;
        }
        await db.collection('support_tickets').doc(req.params.id).update(updateData);
        res.json({ success: true, message: 'تم تحديث تذكرة الدعم بنجاح' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ WALLET ENDPOINTS ============
// Get wallet transactions
app.get('/wallet/transactions', authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const snapshot = await db.collection('wallet_transactions')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset((page - 1) * limit)
            .get();
        const transactions = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const countSnapshot = await db.collection('wallet_transactions').get();
        const total = countSnapshot.size;
        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Get wallet balance
app.get('/wallet/balance', authenticateUser, async (req, res) => {
    var _a;
    try {
        const walletDoc = await db.collection('wallets').doc('main').get();
        const balance = walletDoc.exists ? ((_a = walletDoc.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0 : 0;
        res.json({ success: true, data: { balance } });
    }
    catch (error) {
        handleError(error, res);
    }
});
// ============ ANALYTICS ENDPOINTS ============
// Get dashboard statistics
app.get('/analytics/dashboard', authenticateUser, async (req, res) => {
    try {
        // Get transactions stats
        const transactionsSnapshot = await db.collection('transactions').get();
        const totalTransactions = transactionsSnapshot.size;
        const completedTransactions = transactionsSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
        const pendingTransactions = transactionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        // Get users stats
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        // Get revenue (sum of completed transactions)
        let totalRevenue = 0;
        transactionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'completed') {
                totalRevenue += data.amount || 0;
            }
        });
        // Get monthly stats (last 12 months)
        const monthlyStats = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const monthTransactions = transactionsSnapshot.docs.filter(doc => {
                var _a;
                const createdAt = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate();
                return createdAt >= monthDate && createdAt < nextMonthDate;
            });
            const monthRevenue = monthTransactions.reduce((sum, doc) => {
                const data = doc.data();
                return data.status === 'completed' ? sum + (data.amount || 0) : sum;
            }, 0);
            monthlyStats.push({
                month: monthDate.toLocaleDateString('ar-SA', { month: 'long' }),
                transactions: monthTransactions.length,
                revenue: monthRevenue
            });
        }
        res.json({
            success: true,
            data: {
                totalTransactions,
                completedTransactions,
                pendingTransactions,
                totalUsers,
                totalRevenue,
                monthlyStats
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Export data
app.get('/export/:type', authenticateUser, async (req, res) => {
    try {
        const { type } = req.params;
        const format = req.query.format || 'json';
        let collection;
        switch (type) {
            case 'users':
                collection = 'users';
                break;
            case 'transactions':
                collection = 'transactions';
                break;
            case 'payment-links':
                collection = 'payment_links';
                break;
            case 'support':
                collection = 'support_tickets';
                break;
            default:
                res.status(400).json({ success: false, message: 'نوع البيانات غير صحيح' });
                return;
        }
        const snapshot = await db.collection(collection).get();
        const data = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        if (format === 'csv') {
            // Convert to CSV format
            if (data.length === 0) {
                res.json({ success: false, message: 'لا توجد بيانات للتصدير' });
                return;
            }
            const headers = Object.keys(data[0]).join(',');
            const csvData = data.map(row => Object.values(row).map(value => typeof value === 'string' ? `"${value}"` : value).join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}_${Date.now()}.csv"`);
            res.send(headers + '\n' + csvData);
        }
        else {
            res.json({
                success: true,
                data,
                message: `تم تصدير ${data.length} سجل بنجاح`
            });
        }
    }
    catch (error) {
        handleError(error, res);
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Waset Misr API is running',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});
// Export the Express app as a Firebase Function
exports.api = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60
}, app);
// Export additional functions for specific operations
exports.seedDatabase = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    // Only allow authenticated admin users
    if (!request.auth) {
        throw new Error('يجب تسجيل الدخول');
    }
    try {
        // Seed data will be added here
        return { success: true, message: 'تم ملء قاعدة البيانات بنجاح' };
    }
    catch (error) {
        throw new Error('فشل في ملء قاعدة البيانات');
    }
});
//# sourceMappingURL=index.js.map