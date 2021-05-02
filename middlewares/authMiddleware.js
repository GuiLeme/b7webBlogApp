module.exports.isLogged = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'Ops, Você não tem permissão para acessar esta página')
        res.redirect('/')
        return
    }
    next()
}

exports.changePassword = (req, res, next) => {
    if(req.body.password != req.body['password-confirm']) {
        req.flash('error', "As senhas não batem...")
        res.redirect('/profile')
        return
    }
    req.user.setPassword(req.body.password, async() => {
        await req.user.save()

        req.flash('success', 'Senha alterada com sucesso')
        res.redirect('/')
    })

}