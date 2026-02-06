const express = require('express');
const router = express.Router();

// daos
const ProductDAO = require('../models/ProductDAO');

// Middleware để đếm số lượng trong giỏ hàng
router.use((req, res, next) => {
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
    next();
});

// GET /shop - Danh sách sản phẩm
router.get('/', async (req, res) => {
    const products = await ProductDAO.selectAll();
    res.render('products', { products: products });
});

// GET /shop/product/:id - Chi tiết sản phẩm
router.get('/product/:id', async (req, res) => {
    const product = await ProductDAO.selectById(req.params.id);
    res.render('product-detail', { product: product });
});

// GET /shop/cart - Xem giỏ hàng
router.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    res.render('cart', { cart: cart, total: total });
});

// POST /shop/cart/add - Thêm vào giỏ hàng
router.post('/cart/add', async (req, res) => {
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    // Khởi tạo giỏ hàng nếu chưa có
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingIndex = req.session.cart.findIndex(item => item._id === productId);

    if (existingIndex > -1) {
        // Cộng thêm số lượng
        req.session.cart[existingIndex].quantity += quantity;
    } else {
        // Thêm mới
        const product = await ProductDAO.selectById(productId);
        if (product) {
            req.session.cart.push({
                _id: product._id.toString(),
                name: product.name,
                price: product.price,
                images: product.images,
                quantity: quantity
            });
        }
    }

    res.redirect('/shop/cart');
});

// POST /shop/cart/remove/:id - Xóa khỏi giỏ hàng
router.post('/cart/remove/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item._id !== req.params.id);
    }
    res.redirect('/shop/cart');
});

// POST /shop/cart/update - Cập nhật số lượng
router.post('/cart/update', (req, res) => {
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    if (req.session.cart) {
        const index = req.session.cart.findIndex(item => item._id === productId);
        if (index > -1) {
            req.session.cart[index].quantity = quantity;
        }
    }
    res.redirect('/shop/cart');
});

module.exports = router;
