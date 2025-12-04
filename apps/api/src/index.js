



const express = require('express');
const app = express();

app.use(express.json());
const cors = require('cors');
var csurf = require('csurf');
var cookieParser = require('cookie-parser');

// middlewares





app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors({
  origin: 'http://localhost:4200'
}));

// routes
app.use(require('./api/routes/index'))
const proOt = require('./api/routes/index');




app.listen(3000, 'localhost')
console.log('Server on port 3000')