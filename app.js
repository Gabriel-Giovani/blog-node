const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
const port = 3000;
const ip = '127.0.0.1';
const app = express();
const admin = require('./routes/admin');

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Routes
app.use('/admin', admin);

app.listen(port, ip, () => {

    console.log('Connected in ' + ip + ':' + port);

})