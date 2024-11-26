const express = require('express');
const session = require('express-session');
const path = require('path'); 
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');


app.use(express.static(path.join(__dirname, 'public')));


// Middleware to serve static assets from the "public" directory
app.use(express.static(__dirname + '/public'));

// Middleware to parse incoming request bodies (for handling form data, JSON, etc.)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// EJS configuration
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(session({
  secret: 'akolangpogumawangprojectnamin', // Change this to a more secure secret
  resave: false,
  saveUninitialized: true,
}));

const protectRoute = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/systemLogin');
  }
  next();
};



// Define the default route for login
app.get('/', (req, res) => {
  res.render('systemLogin', { pageTitle: 'System Login Page' });
});



// Define routes
// Route for Registration (Website) 
const websiteRegisterRoute = require('./server/routes/websiteRegisterRoute');
app.use('/customer', websiteRegisterRoute);

// Import the system register route
const systemRegisterRoute = require('./server/routes/systemRegisterRoute');
app.use('/system', systemRegisterRoute);

//Route for Logging In (System)
const systemLoginRoute = require('./server/routes/systemLoginRoute');
app.use('/systemLogin', systemLoginRoute);

//Route for Logging In (Website)
const websiteLoginRoute = require('./server/routes/websiteLoginRoute');
app.use('/websiteLogin', websiteLoginRoute);

//Route for Admin Account (System)
const adminRoute = require('./server/routes/adminRoute');
app.use('/admin', adminRoute);


// Route for Sellers (Add Product functionality, dashboard, etc.)
const sellerRoute = require('./server/routes/sellerRoute');
app.use('/seller', protectRoute, sellerRoute);






//Route for Customer Account (Website)
//const customerRoute = require('./server/routes/customerRoute'); 
//app.use('/customer', customerRoute); 




//Route for Sellers (System)
//const sellerRoute = require('./server/routes/sellerRoute.js'); 
//app.use('/seller', sellerRoute); 



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
