const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');
const EmailUtil = require('../utils/EmailUtil');

// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

// ==================== CATEGORY APIs ====================

// GET - Lấy danh sách tất cả categories
router.get('/categories', JwtUtil.checkToken, async function (req, res) {
    try {
        const categories = await CategoryDAO.selectAll();
        res.json(categories);
    } catch (e) {
        console.error('GET /admin/categories error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy danh sách categories với thông tin category con đầy đủ
router.get('/categories/with-children', JwtUtil.checkToken, async function (req, res) {
    try {
        const categories = await CategoryDAO.selectAllWithChildren();
        res.json(categories);
    } catch (e) {
        console.error('GET /admin/categories/with-children error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST - Thêm category mới
router.post('/categories', JwtUtil.checkToken, async function (req, res) {
    try {
        const { name, parent_category_id } = req.body;
        const category = {
            name: name,
            parent_category_id: parent_category_id || null
        };
        const result = await CategoryDAO.insert(category);
        res.json(result);
    } catch (e) {
        console.error('POST /admin/categories error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT - Sửa category theo id
router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const { name, parent_category_id } = req.body;
        const category = {
            name: name,
            parent_category_id: parent_category_id || null
        };
        const result = await CategoryDAO.update(_id, category);
        res.json(result);
    } catch (e) {
        console.error('PUT /admin/categories error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// DELETE - Xóa category theo id (chỉ xóa khi không có sản phẩm và không có category con)
router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;

        // Kiểm tra có category con không
        const hasChildren = await CategoryDAO.hasChildren(_id);
        if (hasChildren) {
            return res.json({
                success: false,
                error: 'Không thể xóa category này vì có category con'
            });
        }

        // Kiểm tra có product nào thuộc category này không
        const productCount = await ProductDAO.countByCategoryId(_id);
        if (productCount > 0) {
            return res.json({
                success: false,
                error: 'Không thể xóa category này vì có sản phẩm thuộc category'
            });
        }

        const result = await CategoryDAO.delete(_id);
        if (result) {
            res.json({ success: true, id: result._id, name: result.name });
        } else {
            res.json({ success: false, error: 'Category not found or already deleted' });
        }
    } catch (e) {
        console.error('DELETE /admin/categories error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== PRODUCT APIs ====================

// GET - Lấy danh sách products với pagination
router.get('/products', JwtUtil.checkToken, async function (req, res) {
    try {
        const sizePage = 4;
        const curPage = parseInt(req.query.page) || 1;

        // Đếm tổng số products và tính số trang
        const total = await ProductDAO.countAll();
        const noPages = Math.ceil(total / sizePage);

        // Lấy products theo trang (sử dụng skip/limit của MongoDB)
        const products = await ProductDAO.selectWithPagination(curPage, sizePage);

        res.json({ products: products, noPages: noPages, curPage: curPage });
    } catch (e) {
        console.error('GET /admin/products error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Tìm kiếm product theo tên
router.get('/products/search', JwtUtil.checkToken, async function (req, res) {
    try {
        const keyword = req.query.keyword || '';
        const products = await ProductDAO.searchByName(keyword);
        res.json(products);
    } catch (e) {
        console.error('GET /admin/products/search error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Tìm danh sách product theo category
router.get('/products/category/:categoryId', JwtUtil.checkToken, async function (req, res) {
    try {
        const categoryId = req.params.categoryId;
        const products = await ProductDAO.selectByCategoryId(categoryId);
        res.json(products);
    } catch (e) {
        console.error('GET /admin/products/category error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy product theo id
router.get('/products/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const product = await ProductDAO.selectById(_id);
        if (product) {
            res.json(product);
        } else {
            res.json({ error: 'Product not found' });
        }
    } catch (e) {
        console.error('GET /admin/products/:id error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST - Thêm product mới
router.post('/products', JwtUtil.checkToken, async function (req, res) {
    try {
        const { name, description, price, categories_id, images, show } = req.body;
        const product = {
            name: name,
            description: description || '',
            price: price || 0,
            categories_id: categories_id || [],
            images: images || [],
            show: show !== undefined ? show : true
        };
        const result = await ProductDAO.insert(product);
        res.json(result);
    } catch (e) {
        console.error('POST /admin/products error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT - Sửa product theo id
router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const { name, description, price, categories_id, images, show } = req.body;
        const product = {
            name: name,
            description: description,
            price: price,
            categories_id: categories_id,
            images: images,
            show: show
        };
        const result = await ProductDAO.update(_id, product);
        if (result) {
            res.json(result);
        } else {
            res.json({ error: 'Product not found' });
        }
    } catch (e) {
        console.error('PUT /admin/products/:id error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// DELETE - Xóa product theo id
router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const result = await ProductDAO.delete(_id);
        if (result) {
            res.json({ success: true, id: result._id, name: result.name });
        } else {
            res.json({ success: false, error: 'Product not found or already deleted' });
        }
    } catch (e) {
        console.error('DELETE /admin/products/:id error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== CUSTOMER APIs ====================

// GET - Lấy danh sách tất cả customers
router.get('/customers', JwtUtil.checkToken, async function (req, res) {
    try {
        const customers = await CustomerDAO.selectAll();
        res.json(customers);
    } catch (e) {
        console.error('GET /admin/customers error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Lấy danh sách orders theo customer ID
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
    try {
        const _cid = req.params.cid;
        const orders = await OrderDAO.selectByCustID(_cid);
        res.json(orders);
    } catch (e) {
        console.error('GET /admin/orders/customer error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT - Deactive customer
router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const token = req.body.token;
        const result = await CustomerDAO.active(_id, token, 0);
        res.json(result);
    } catch (e) {
        console.error('PUT /admin/customers/deactive error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET - Send mail to customer
router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const cust = await CustomerDAO.selectByID(_id);
        if (cust) {
            const send = await EmailUtil.send(cust.email, cust._id, cust.token);
            if (send) {
                res.json({ success: true, message: 'Please check email' });
            } else {
                res.json({ success: false, message: 'Email failure' });
            }
        } else {
            res.json({ success: false, message: 'Not exists customer' });
        }
    } catch (e) {
        console.error('GET /admin/customers/sendmail error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== ORDER APIs ====================

// GET - Lấy danh sách tất cả orders
router.get('/orders', JwtUtil.checkToken, async function (req, res) {
    try {
        const orders = await OrderDAO.selectAll();
        res.json(orders);
    } catch (e) {
        console.error('GET /admin/orders error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT - Cập nhật status của order
router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
    try {
        const _id = req.params.id;
        const newStatus = req.body.status;
        const result = await OrderDAO.update(_id, newStatus);
        res.json(result);
    } catch (e) {
        console.error('PUT /admin/orders/status error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== AUTH APIs ====================

// login
router.post('/login', async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (username && password) {
            const admin = await AdminDAO.selectByUsernameAndPassword(username, password);

            if (admin) {
                const token = JwtUtil.genToken(username, password);
                res.json({ success: true, message: 'Authentication successful', token: token });
            } else {
                res.json({ success: false, message: 'Incorrect username or password' });
            }
        } else {
            res.json({ success: false, message: 'Please input username and password' });
        }
    } catch (e) {
        console.error('POST /admin/login error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    res.json({ success: true, message: 'Token is valid', token: token });
});

module.exports = router;
