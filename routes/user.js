const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/User');
const User = mongoose.model('User');


router.get('/register', (req, res) => {

    res.render('../views/user/register');

});

router.post('/register', (req, res) => {

    let errors = [];
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;
    
    if(!name || typeof name == undefined || name == null){

        errors.push({text: 'Campo "Nome" vazio!'});

    }

    if(!email || typeof email == undefined || email == null){

        errors.push({text: 'Campo "Email" vazio!'});

    }

    if(!password || typeof password == undefined || password == null){

        errors.push({text: 'Campo "Senha" vazio!'});

    }

    if(!confirm_password || typeof confirm_password == undefined || confirm_password == null){

        errors.push({text: 'Campo "Confirme a senha" vazio!'});

    }

    if(password.length < 6){

        errors.push({text: 'A senha deve ter no mínimo 6 caracteres!'});

    }

    if(password != confirm_password){

        errors.push({text: 'As senhas não conferem!'});

    }

    if(errors.length > 0){

        res.render('../views/user/register', {errors: errors});

    } else{

        User.findOne({email: email}).lean().then((user) => {

            if(user){

                req.flash('error_msg', 'Este e-mail já foi cadastrado por outro usuário!');
                res.redirect('/user/register');

            } else{

                const newUser = {

                    name: name,
                    email: email,
                    password: password
        
                }

                bcrypt.genSalt(10, (error, salt) => {

                    bcrypt.hash(newUser.password, salt, (error, hash) => {

                        if(error){

                            req.flash('error_msg', 'Houve um erro no registro do usuário. Tente mais tarde!');
                            res.redirect('/');

                        } else{

                            newUser.password = hash;

                            new User(newUser).save().then(() => {

                                req.flash('success_msg', 'Usuário cadastrado com sucesso!');
                                res.redirect('/');
                    
                            }).catch((error) => {
                    
                                req.flash('error_msg', 'Houve um erro ao cadastrar o usuário. Tente mais tarde!');
                                res.redirect('/');
                    
                            });

                        }

                    });

                });

            }

        }).catch((error) => {

            req.flash('error_msg', 'Houve um erro interno. Tente mais tarde!');
            res.redirect('/');

        });

    }

});


module.exports = router;