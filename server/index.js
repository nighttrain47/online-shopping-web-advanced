// CLI: npm install express body-parser ejs express-session connect-mongo --save

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const path = require('path');
const MyConstants = require('./utils/MyConstants');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB URI
const mongoUri = 'mongodb+srv://' + MyConstants.DB_USER + ':' + MyConstants.DB_PASS + '@' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE;

// EJS view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session for cart - stored in MongoDB
let sessionStore;
try {
  // Thử dùng API mới (connect-mongo v4+)
  sessionStore = MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions'
  });
} catch (e) {
  // Fallback cho API cũ (connect-mongo v3)
  sessionStore = new MongoStore({
    url: mongoUri,
    collection: 'sessions'
  });
}

app.use(session({
  secret: MyConstants.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// apis
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// admin apis  
app.use('/api/admin', require('./api/admin.js'));

// customer apis
app.use('/api/customer', require('./api/customer.js'));

// shop routes (EJS)
app.use('/shop', require('./api/shop.js'));

// Serve client-admin build
app.use('/admin', express.static(path.resolve(__dirname, '../client-admin/build')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-admin/build', 'index.html'));
});

// Serve client-customer build
app.use('/', express.static(path.resolve(__dirname, '../client-customer/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-customer/build', 'index.html'));
});

// start server
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});