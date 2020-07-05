const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
const linkMongo = 'mongodb://localhost/blogapp';
const port = 3000;
const ip = '127.0.0.1';
const app = express();
const admin = require('./routes/admin');

//Connect MongoDB
mongoose.Promise = global.Promise;

mongoose.connect(linkMongo).then(() => {

    console.log('Connected in ' + linkMongo);

}).catch((error) => {

    console.log('Error connecting to ' + linkMongo + ': ' + error);

});

//Session
app.use(session({

    secret: 'blognode',
    resave: true,
    saveUninitialized: true

}));

//Flash
app.use(flash());

//Middleware
app.use((req, res, next) => {

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    next();

});

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Engines
app.engine('handlebars', handlebars({

    defaultLayout: 'main',
    helpers:{

        formatDate: (date) => {

            return moment(date).format('DD/MM/YYYY HH:MM');

        }

    }

}));
app.set('view engine', 'handlebars');

//Public
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/admin', admin);

app.listen(port, ip, () => {

    console.log('Connected in ' + ip + ':' + port);

})