const express = require('express');
const app =express();
const cors = require('cors');
var csurf = require('csurf');
var cookieParser = require('cookie-parser');

// middlewares





app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cors({
    origin: 'http://192.168.1.12:4200'
  }));
  
// routes
app.use(require('./routes/index'))
const proOt = require('./routes/index');




app.listen(3000,'192.168.1.12')
console.log('Server on port 3000')