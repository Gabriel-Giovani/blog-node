const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
require('../models/Category');
const Category = mongoose.model('Category');
require('../models/Posts');
const Post = mongoose.model('Post');
const {isAdmin} = require('../utils/isAdmin');
const multer = require('multer');

const storage = multer.diskStorage({

    destination: (req, file, callBack) => {

        callBack(null, 'uploads/');

    },
    filename: (req, file, callBack) => {

        callBack(null, file.originalname + Date.now() + path.extname(file.originalname));

    }

});

const upload = multer({storage});

router.get('/', isAdmin, (req, res) => {

    res.render('../views/admin/index');

});

router.get('/cat', isAdmin, (req, res) => {

    Category.find().sort([['date', -1]]).lean().then((categories) => {

        res.render('../views/admin/categories', {categories: categories});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');

    });

});

router.get('/cat/add', isAdmin, (req, res) => {

    res.render('../views/admin/addCategories');

});

router.post('/cat/new', isAdmin, (req, res) => {

    let name = req.body.name;
    let slug = req.body.slug;
    let errors = [];

    if(!name || typeof name == undefined || name == null){

        errors.push({ text: 'Existem campos vazios!' });

    }

    else if(!slug || typeof slug == undefined || slug == null){

        errors.push({ text: 'Existem campos vazios!' });

    }

    else if(name.length < 2){

        errors.push({ text: 'Nome de categoria muito pequeno!' });

    }

    if(errors.length > 0){

        res.render('../views/admin/addCategories', {errors: errors});

    } else{

        const newCategory = {

            name: name,
            slug: slug
    
        };

        new Category(newCategory).save().then(() => {

            req.flash('success_msg', 'Categoria cadastrada com sucesso!');
            res.redirect('/admin/cat');
    
        }).catch((error) => {
    
            req.flash('error_msg', 'Erro ao cadastrar categoria. Tente novamente mais tarde!');
            res.rendirect('/admin/cat');

            console.log('Register category error: ' + error);
    
        });

    }

});

router.get('/cat/edit/:id', isAdmin, (req, res) => {

    Category.findOne({_id:req.params.id}).lean().then((category) => {

        res.render('../views/admin/editCategories', {category: category});
 
    }).catch((error) => {

        req.flash('error_msg', 'Essa categoria não existe!');
        res.redirect('/admin/cat');

    });

});

router.post('/cat/edit', isAdmin, (req, res) => {

    Category.findOne({_id: req.body.id}).then((category) => {

        let id = req.body.id;
        let name = req.body.name;
        let slug = req.body.slug;
        let errors = [];

        if(!name || typeof name == undefined || name == null){

            errors.push({ text: 'Existem campos vazios!' });
    
        }
    
        else if(!slug || typeof slug == undefined || slug == null){
    
            errors.push({ text: 'Existem campos vazios!' });
    
        }
    
        else if(name.length < 2){
    
            errors.push({ text: 'Nome de categoria muito pequeno!' });
    
        }
    
        if(errors.length > 0){
    
            res.render('../views/admin/editCategories', {
                errors: errors,
                category:{
                    _id: id,
                    name: name,
                    slug: slug
                }
            });
    
        } else{

            category.name = name;
            category.slug = slug;

            category.save().then(() => {

                req.flash('success_msg', 'Categoria editada com sucesso!');
                res.redirect('/admin/cat');

            }).catch((error) => {

                req.flash('error_msg', 'Houve um erro ao editar a categoria. Tente mais tarde!');
                res.redirect('/admin/cat');

            });

        }

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao editar a categoria. Tente mais tarde!');
        res.redirect('/admin/cat');

    })

});

router.post('/cat/delete', isAdmin, (req, res) => {

    Category.remove({_id: req.body.id}).then(() => {

        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/cat');

    }).catch((error) => {

        req.flash('error_msg', 'Hove um erro ao deletar a categoria. Tente mais tarde!');
        res.redirect('/admin/cat');

    });

});

router.get('/cat/cancel', isAdmin, (req, res) => {

    res.redirect('/admin/cat');

});

router.get('/posts', isAdmin, (req, res) => {

    Post.find().populate('category').sort([['date', 'desc']]).lean().then((posts) => {

        res.render('../views/admin/posts', {posts: posts});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao listar as postagens!');
        res.redirect('/admin');

    });

});

router.get('/posts/add', isAdmin, (req, res) => {

    Category.find().lean().then((categories) => {

        res.render('../views/admin/addPosts', {categories: categories});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao carregar a lista de categorias. Tente mais tarde!');
        res.redirect('/admin/posts/add');

    });

});

router.post('/posts/new', isAdmin, upload.single('image'), (req, res) => {

    let title = req.body.title;
    let slug = req.body.slug;
    let category = req.body.category;
    let desc = req.body.desc;
    let content = req.body.content;
    let image = "";
    let allowedExt = ['jpg', 'png', 'gif', 'jpeg'];
    let errors = [];

    if(!title || typeof title == undefined || title == null){

        errors.push({ text: 'Campo "título" obrigatório!' });

    }

    else if(!slug || typeof slug == undefined || slug == null){

        errors.push({ text: 'Campo "slug" obrigatório!' });

    }

    if(category == '0'){

        errors.push({text: 'Categoria inválida. Registre uma categoria antes de salvar uma postagem.'});

    }

    if(!req.file){

        image = 'default.png';

    } else{

        image = req.file.filename;

    }

    let imageExt = image.split('.').pop();

    if(typeof allowedExt.find((ext) => { return imageExt == ext; }) == 'undefined'){

        errors.push({text: 'Extensão de arquivo não permitida!'});

    }

    if(errors.length > 0){

        Category.find().lean().then((categories) => {

            res.render('../views/admin/addPosts', {
                errors: errors,
                categories: categories
            });

        });

    } else{

        const newPost = {

            title: title,
            slug: slug,
            category: category,
            description: desc,
            content: content,
            image: image

        }

        new Post(newPost).save().then(() => {

            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/posts');

        }).catch((error) => {

            req.flash('error_msg', 'Houve um erro ao salvar a postagem. Tente novamente mais tarde!' + error);
            res.redirect('/admin/posts');

        });

    }

});

router.get('/posts/edit/:id', isAdmin, (req, res) => {

    Post.findOne({_id: req.params.id}).lean().then((post) => {

        Category.find().lean().then((categories) => {

            res.render('../views/admin/editPosts', {
                post: post,
                categories: categories
            });

        });

    }).catch((error) => {

        req.flash('error_msg', 'Essa postagem não existe!');
        res.redirect('/admin/posts');

    });

});

router.post('/posts/edit', isAdmin, upload.single('image'), (req, res) => {

    Post.findOne({_id: req.body.id}).then((post) => {

        let id = req.body.id;
        let title = req.body.title;
        let slug = req.body.slug;
        let category = req.body.category;
        let desc = req.body.desc;
        let content = req.body.content;
        let image = "";
        let allowedExt = ['jpg', 'png', 'gif', 'jpeg'];
        let errors = [];

        if(!title || typeof title == undefined || title == null){

            errors.push({ text: 'Campo "título" obrigatório!' });

        }

        else if(!slug || typeof slug == undefined || slug == null){

            errors.push({ text: 'Campo "slug" obrigatório!' });

        }

        if(category == '0'){

            errors.push({text: 'Categoria inválida. Registre uma categoria antes de salvar uma postagem.'});

        }

        if(!req.file){

            image = post.image;

        } else{

            image = req.file.filename;

        }

        let imageExt = image.split('.').pop();

        if(typeof allowedExt.find((ext) => { return imageExt == ext; }) == 'undefined'){

            errors.push({text: 'Extensão de arquivo não permitida!'});
    
        }
        
        if(errors.length > 0){

            Category.find().lean().then((categories) => {

                res.render('../views/admin/editPosts', {
                    errors: errors,
                    categories: categories,
                    post:{
                        _id: id,
                        title: title,
                        slug: slug,
                        category: category,
                        description: desc,
                        content: content,
                        image: image
                    }
                });

            });

        } else{

            post.title = title;
            post.slug = slug;
            post.category = category;
            post.description = desc;
            post.content = content;
            post.image = image;

            post.save().then(() => {

                req.flash('success_msg', 'Postagem editada com sucesso!');
                res.redirect('/admin/posts');

            }).catch((error) => {

                req.flash('error_msg', 'Houve um erro ao editar a postagem. Tente mais tarde!');
                res.redirect('/admin/posts');

            });

        }

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao editar a postagem. Tente mais tarde!: ' + error);
        res.redirect('/admin/posts');

    });

});

router.post('/posts/delete', isAdmin, (req, res) => {

    Post.remove({_id: req.body.id}).then(() => {

        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/posts');

    }).catch((error) => {

        req.flash('error_msg', 'Hove um erro ao deletar a postagem. Tente mais tarde!');
        res.redirect('/admin/posts');

    });

});

router.get('/posts/cancel', isAdmin, (req, res) => {

    res.redirect('/admin/posts');

});

module.exports = router;