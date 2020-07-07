const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('Category');

router.get('/', (req, res) => {

    res.render('../views/admin/index');

});

router.get('/posts', (req, res) => {

    res.send('Página de posts');

});

router.get('/cat', (req, res) => {

    Category.find().sort([['date', -1]]).lean().then((categories) => {

        res.render('../views/admin/categories', {categories: categories});

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');

    })

});

router.get('/cat/add', (req, res) => {

    res.render('../views/admin/addCategories');

});

router.post('/cat/new', (req, res) => {

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

router.get('/cat/edit/:id', (req, res) => {

    Category.findOne({_id:req.params.id}).lean().then((category) => {

        res.render('../views/admin/editCategories', {category: category});
 
    }).catch((error) => {

        req.flash('error_msg', 'Essa categoria não existe!');
        res.redirect('/admin/cat');

    });

});

router.post('/cat/edit', (req, res) => {

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

router.post('/cat/delete', (req, res) => {

    Category.remove({_id: req.body.id}).then(() => {

        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/cat');

    }).catch((error) => {

        req.flash('error_msg', 'Hove um erro ao deletar a categoria. Tente mais tarde!');
        res.redirect('/admin/cat');

    });

});

router.get('/cat/cancel', (req, res) => {

    res.redirect('/admin/cat');

});

module.exports = router;