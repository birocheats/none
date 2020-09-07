const User = require('../models/user');

module.exports.create = async function(req, res) {
    if (req.body.password != req.body.confirm_password) {
        return res.redirect('back');
    }
    let user = await User.findOne({email: req.body.email}).lean();
    if(user){
        return res.redirect('/users/login');
    }else{
        let newUser = await User.create(req.body);
        if(newUser){
            return res.redirect('/users/login');
        }else{
            return res.redirect('back');
        }
    }
}

module.exports.signup = async(req,res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('signup', {
        title: "BiroCheats || Signup"
    });
};

module.exports.login = (req,res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('login', {title: 'BiroCheats || Login'});
};


module.exports.createSession = async (req,res) => {
    try {
        let user = await User.findOne({email: req.body.email}).lean();
        if (!user || user.password != req.body.password) {
            return res.redirect('back');
        }
        return res.redirect('/');
    } catch (error) {
        if(error){
            return res.redirect('back');
        }
    }
};

module.exports.destroySession = function(req, res) {
    req.logout();
    return res.redirect('/');
};

