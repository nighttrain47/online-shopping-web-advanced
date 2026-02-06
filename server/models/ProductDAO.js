require('../utils/MongooseUtil');
const Models = require('./Models');

const ProductDAO = {
    // Lấy danh sách tất cả products
    async selectAll() {
        const products = await Models.Product.find({})
            .populate('categories_id')
            .exec();
        return products;
    },

    // Thêm product mới
    async insert(product) {
        const mongoose = require('mongoose');
        product._id = new mongoose.Types.ObjectId();
        const result = await Models.Product.create(product);
        return result;
    },

    // Xóa product theo id
    async delete(_id) {
        const result = await Models.Product.findByIdAndDelete(_id.trim());
        return result;
    },

    // Sửa product theo id
    async update(_id, product) {
        const result = await Models.Product.findByIdAndUpdate(_id.trim(), product, { new: true });
        return result;
    },

    // Tìm kiếm product theo tên
    async searchByName(keyword) {
        const products = await Models.Product.find({
            name: { $regex: keyword, $options: 'i' }
        }).populate('categories_id').exec();
        return products;
    },

    // Tìm danh sách product theo category
    async selectByCategoryId(categoryId) {
        const products = await Models.Product.find({
            categories_id: categoryId
        }).populate('categories_id').exec();
        return products;
    },

    // Lấy product theo id
    async selectById(_id) {
        const product = await Models.Product.findById(_id.trim())
            .populate('categories_id')
            .exec();
        return product;
    },

    // Kiểm tra xem category có product nào không
    async countByCategoryId(categoryId) {
        const count = await Models.Product.countDocuments({
            categories_id: categoryId
        });
        return count;
    },

    // Đếm tổng số products
    async countAll() {
        const count = await Models.Product.countDocuments({});
        return count;
    },

    // Lấy danh sách products với pagination (tối ưu với skip/limit của MongoDB)
    async selectWithPagination(page, limit) {
        const skip = (page - 1) * limit;
        const products = await Models.Product.find({})
            .populate('categories_id')
            .skip(skip)
            .limit(limit)
            .exec();
        return products;
    },

    // Lấy top sản phẩm mới nhất (theo ngày tạo)
    async selectTopNew(top) {
        const query = {};
        const mysort = { cdate: -1 }; // descending - mới nhất trước
        const products = await Models.Product.find(query)
            .sort(mysort)
            .limit(top)
            .exec();
        return products;
    },

    // Lấy top sản phẩm bán chạy nhất (từ orders đã APPROVED)
    async selectTopHot(top) {
        const items = await Models.Order.aggregate([
            { $match: { status: 'APPROVED' } },
            { $unwind: '$items' },
            { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
            { $sort: { sum: -1 } }, // descending - bán nhiều nhất trước
            { $limit: top }
        ]).exec();

        var products = [];
        for (const item of items) {
            const product = await this.selectById(item._id);
            if (product) {
                products.push(product);
            }
        }
        return products;
    },

    // Lấy danh sách products theo category ID (cho customer)
    async selectByCatID(_cid) {
        const query = { 'category._id': _cid };
        const products = await Models.Product.find(query).exec();
        return products;
    },

    // Tìm kiếm products theo keyword (cho customer)
    async selectByKeyword(keyword) {
        const query = { name: { $regex: new RegExp(keyword, "i") } };
        const products = await Models.Product.find(query).exec();
        return products;
    }
};

module.exports = ProductDAO;
