require('dotenv').config();

const MyConstants = {
    DB_SERVER: process.env.DB_SERVER || 'cluster01.5ciw2wr.mongodb.net',
    DB_USER: process.env.DB_USER || 'ktb1',
    DB_PASS: process.env.DB_PASS || '',
    DB_DATABASE: process.env.DB_DATABASE || 'Cluster01',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    JWT_SECRET: process.env.JWT_SECRET || 'shopping_online_secret_key_2024',
    JWT_EXPIRES: process.env.JWT_EXPIRES || '86400000',
    SESSION_SECRET: process.env.SESSION_SECRET || 'shopping_online_session_secret'
};

module.exports = MyConstants;
