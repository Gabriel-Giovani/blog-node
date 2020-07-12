const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Passport = require('passport');
require('../models/User');
const User = mongoose.model('User');

module.exports = (passport) => {

    passport.use(new localStrategy({

        usernameField: 'email',
        passwordField: 'password'

    }, (email, password, done) => {

        User.findOne({email: email}).then((user) => {

            if(!user){

                return done(null, false, {message: 'Esta conta não existe!'});

            }

            bcrypt.compare(password, user.password, (error, check) => {

                if(check){

                    return done(null, user);

                } else{

                    return done(null, false, {message: 'Senha incorreta'});

                }

            });

        });

    }));

    passport.serializeUser((user, done) => {

        done(null, user.id);

    });

    passport.deserializeUser((id, done) => {

        User.findById(id, (error, user) => {

            return done(error, user);

        });

    });

}