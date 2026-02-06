require('../utils/MongooseUtil');
const Models = require('./Models');

const CategoryDAO = {
    // Lấy danh sách tất cả categories với thông tin category con
    async selectAll() {
        const categories = await Models.Category.find({}).exec();
        return categories;
    },

    // Lấy danh sách categories với đầy đủ thông tin category con
    async selectAllWithChildren() {
        const categories = await Models.Category.find({}).exec();

        // Tạo map để dễ tìm kiếm
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat._id.toString()] = {
                ...cat.toObject(),
                children: []
            };
        });

        // Gán children cho mỗi category
        const result = [];
        categories.forEach(cat => {
            const catObj = categoryMap[cat._id.toString()];
            if (cat.parent_category_id) {
                const parentId = cat.parent_category_id.toString();
                if (categoryMap[parentId]) {
                    categoryMap[parentId].children.push(catObj);
                }
            } else {
                result.push(catObj);
            }
        });

        return result;
    },

    // Thêm category mới
    async insert(category) {
        const mongoose = require('mongoose');
        category._id = new mongoose.Types.ObjectId();
        const result = await Models.Category.create(category);
        return result;
    },

    // Xóa category theo id (chỉ xóa khi không có sản phẩm và không có category con)
    async delete(_id) {
        const result = await Models.Category.findByIdAndDelete(_id);
        return result;
    },

    // Kiểm tra xem category có category con không
    async hasChildren(_id) {
        const count = await Models.Category.countDocuments({ parent_category_id: _id });
        return count > 0;
    },

    // Sửa category theo id
    async update(_id, category) {
        const result = await Models.Category.findByIdAndUpdate(_id, category, { new: true });
        return result;
    },

    // Lấy category theo id
    async selectById(_id) {
        const category = await Models.Category.findById(_id).exec();
        return category;
    }
};

module.exports = CategoryDAO;
