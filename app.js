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
const user = require('./routes/user');

require('./models/Posts');
const Post = mongoose.model('Post');
require('./models/Category');
const Category = mongoose.model('Category');

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
app.use('/user', user);

app.get('/', (req, res) => {

    Post.find().lean().populate('category').sort({date: 'desc'}).then((post) => {

        res.render('index', {post: post});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro interno. Volte mais tarde!');
        res.redirect('/404');

    });

});

app.get('/posts/:slug', (req, res) => {

    Post.findOne({slug: req.params.slug}).lean().populate('category').then((post) => {

        if(post){

            res.render('../views/post/index', {post: post});

        } else{

            req.flash('error_msg', 'Esta postagem não existe!');
            res.redirect('/');

        }

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro interno!');
        res.redirect('/');

    });

});

app.get('/categories', (req, res) => {

    Category.find().lean().then((categories) => {

        res.render('../views/category/index', {categories: categories});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao listar as categorias. Tente mais tarde!');
        req.redirect('/');

    });

});

app.get('/categories/:slug', (req, res) => {

    Category.findOne({slug: req.params.slug}).lean().then((category) => {

        if(category){

            Post.find({category: category._id}).lean().then((post) => {

                res.render('../views/category/posts', {post: post, category: category});

            }).catch((error => {

                req.flash('error_msg', 'Houve um erro ao carregar as postagens desta categoria. tente mais tarde!');
                res.redirect('/categories');

            }));

        } else{

            req.flash('error_msg', 'Esta categoria não existe!');
            res.redirect('/categories');

        }

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao listar as postagens desta categoria. Tente mais tarde!');
        res.redirect('/categories');

    });

});

app.get('/404', (req, res) => {

    res.send('Error 404!');

})

app.listen(port, ip, () => {

    console.log('Connected in ' + ip + ':' + port);

})