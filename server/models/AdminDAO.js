require('../utils/MongooseUtil');
const Models = require('./Models');

const AdminDAO = {
    async selectByUsernameAndPassword(username, password) {
        const query = { username: username, password: password };
        console.log('Query:', query);
        const admin = await Models.Admin.findOne(query);
        console.log('Result:', admin);
        return admin;
    }
};

module.exports = AdminDAO;
