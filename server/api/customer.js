const express = require('express');
const router = express.Router();

// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

// ==================== CATEGORY APIs ====================

// GET - Lấy danh sách tất cả categories
router.get('/categories', async function (req, res) {
    try {
        const categories = await CategoryDAO.selectAll();
        res.json(categories);
    } catch (e) {
        console.error('GET /categories error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== PRODUCT APIs ====================

// GET - Lấy top sản phẩm mới nhất
router.get('/products/new', async function (req, res) {
    try {
        const products = await ProductDAO.selectTopNew(3);
        res.json(products);
    } catch (e) {
        console.error('GET /products/new error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy top sản phẩm bán chạy nhất
router.get('/products/hot', async function (req, res) {
    try {
        const products = await ProductDAO.selectTopHot(3);
        res.json(products);
    } catch (e) {
        console.error('GET /products/hot error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy products theo category ID
router.get('/products/category/:cid', async function (req, res) {
    try {
        const _cid = req.params.cid;
        const products = await ProductDAO.selectByCatID(_cid);
        res.json(products);
    } catch (e) {
        console.error('GET /products/category error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Tìm kiếm products theo keyword
router.get('/products/search/:keyword', async function (req, res) {
    try {
        const keyword = req.params.keyword;
        const products = await ProductDAO.selectByKeyword(keyword);
        res.json(products);
    } catch (e) {
        console.error('GET /products/search error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy product theo ID
router.get('/products/:id', async function (req, res) {
    try {
        const _id = req.params.id;
        const product = await ProductDAO.selectById(_id);
        res.json(product);
    } catch (e) {
        console.error('GET /products/:id error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== CUSTOMER APIs ====================

// POST - Đăng ký tài khoản
router.post('/signup', async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;
        const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
        if (dbCust) {
            res.json({ success: false, message: 'Exists username or email' });
        } else {
            const now = new Date().getTime(); // milliseconds
            const token = CryptoUtil.md5(now.toString());
            const newCust = { username: username, password: password, name: name, phone: phone, email: email, active: 0, token: token };
            const result = await CustomerDAO.insert(newCust);
            if (result) {
                const send = await EmailUtil.send(email, result._id, token);
                if (send) {
                    res.json({ success: true, message: 'Please check email' });
                } else {
                    res.json({ success: false, message: 'Email failure' });
                }
            } else {
                res.json({ success: false, message: 'Insert failure' });
            }
        }
    } catch (e) {
        console.error('POST /signup error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST - Kích hoạt tài khoản
router.post('/active', async function (req, res) {
    try {
        const _id = req.body.id;
        const token = req.body.token;
        const result = await CustomerDAO.active(_id, token, 1);
        res.json(result);
    } catch (e) {
        console.error('POST /active error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST - Đăng nhập
router.post('/login', async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (username && password) {
            const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
            if (customer) {
                if (customer.active === 1) {
                    const token = JwtUtil.genToken();
                    res.json({ success: true, message: 'Authentication successful', token: token, customer: customer });
                } else {
                    res.json({ success: false, message: 'Account is deactive' });
                }
            } else {
                res.json({ success: false, message: 'Incorrect username or password' });
            }
        } else {
            res.json({ success: false, message: 'Please input username and password' });
        }
    } catch (e) {
        console.error('POST /login error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Kiểm tra token
router.get('/token', JwtUtil.checkToken, function (req, res) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    res.json({ success: true, message: 'Token is valid', token: token });
});

// PUT - Cập nhật thông tin khách hàng
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const username = req.body.username;
        const password = req.body.password;
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;
        const customer = { _id: _id, username: username, password: password, name: name, phone: phone, email: email };
        const result = await CustomerDAO.update(customer);
        res.json(result);
    } catch (e) {
        console.error('PUT /customers/:id error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// mycart
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
    try {
        const now = new Date().getTime(); // milliseconds
        const total = req.body.total;
        const items = req.body.items;
        const customer = req.body.customer;
        const order = { cdate: now, total: total, status: 'PENDING', customer: customer, items: items };
        const result = await OrderDAO.insert(order);
        res.json(result);
    } catch (e) {
        console.error('POST /checkout error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// myorders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
    try {
        const _cid = req.params.cid;
        const orders = await OrderDAO.selectByCustID(_cid);
        res.json(orders);
    } catch (e) {
        console.error('GET /orders/customer/:cid error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
