const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
const linkMongo = 'mongodb+srv://admin:<admin>@cluster0.knudl.mongodb.net/<BLOG_APP>?retryWrites=true&w=majority';
const port = process.env.PORT || 3000;
const ip = '127.0.0.1';
const app = express();
const admin = require('./routes/admin');
const user = require('./routes/user');
const passport = require('passport');
require('./config/auth')(passport);

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

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//Middleware
app.use((req, res, next) => {

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;

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
app.use(express.static(__dirname + '/'));

//Routes
app.use('/admin', admin);
app.use('/user', user);

app.get('/', (req, res) => {

    Post.find().lean().populate('category').sort({date: 'desc'}).then((post) => {

        Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

            res.render('index', {
                post: post,
                posts_footer: posts_footer
            });

        });

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro interno. Volte mais tarde!');
        res.redirect('/404');

    });

});

app.get('/posts/:slug', (req, res) => {

    Post.findOne({slug: req.params.slug}).lean().populate('category').then((post) => {

        if(post){

            Category.find().lean().then((categories) => {

                Post.find().lean().limit(5).sort({date: 'desc'}).then((posts) => {

                    Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

                        res.render('../views/post/index', {
                            post: post,
                            posts: posts,
                            posts_footer: posts_footer,
                            categories: categories
                        });

                    });

                });

            });

        } else{

            req.flash('error_msg', 'Esta postagem não existe!');
            res.redirect('/');

        }

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro interno!');
        res.redirect('/');

    });

});

app.get('/categories/:slug', (req, res) => {

    Category.findOne({slug: req.params.slug}).lean().then((category) => {

        if(category){

            Post.find({category: category._id}).lean().sort({date: 'desc'}).then((post) => {

                Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

                    res.render('../views/category/posts', {
                        post: post,
                        posts_footer: posts_footer,
                        category: category
                    });

                });

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

app.get('/about', (req, res) => {

    Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

        res.render('../views/about/about', {posts_footer: posts_footer});

    });

});

app.get('/contact', (req, res) => {

    Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

        res.render('../views/contact/contact', {posts_footer: posts_footer});

    });

});

app.get('/404', (req, res) => {

    Post.find().lean().limit(3).sort({date: 'desc'}).then((posts_footer) => {

        res.send('Error 404!', {posts_footer: posts_footer});

    });

});

app.listen(port, ip, () => {

    console.log('Connected in ' + ip + ':' + port);

})