module.exports = {

    isAdmin: (req, res, next) => {

        if(req.isAuthenticated() && req.user.isAdmin == 1){

            return next();

        }

        req.flash('error_msg', 'Você deve estar logado como administrador para acessar esta área!');
        res.redirect('/user/login');

    }

}