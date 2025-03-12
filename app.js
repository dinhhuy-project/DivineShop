const express = require('express');
const connectDB = require('./config/database'); 
const app = express();
const routes = require('./app/routes');
const session = require('express-session');
const path = require('path');
const flash = require('express-flash');

connectDB();

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layouts/main'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,   
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions', 
    autoRemove: 'interval',
    autoRemoveInterval: 10
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));
app.use((req, res, next) => {
  if (req.session) {
      req.session.touch();
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  const slashCount = req.url.split('/').filter(part => part !== '').length;
  res.locals.relativePath = '../'.repeat(Math.max(0, slashCount - 1)); 
  next();
});

app.use(morgan('dev'));
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});