const User = require('../models/User')
const crypto = require('crypto')
const mailHandler = require('../handlers/mailHandler')

exports.login = (req, res) => {
    res.render('login')
}

exports.loginAction = (req, res) => {
    const auth = User.authenticate()
    
    auth(req.body.email, req.body.password, (error, result) => {
        if(!result) {
            req.flash("error", "Seu e-mail e/ou senha estão errados")
            res.redirect('/users/login')
            return
        }

        req.login(result, () => {})

        req.flash('success', 'Você foi logado com sucesso')
        res.redirect('/')
    })
}

exports.register = (req, res) => {
    res.render('register')
}

exports.registerAction = (req, res) => {
    const newUser = new User(req.body)
    User.register(newUser, req.body.password, (error) => {
        if (error) {
            console.log('Erro ao registrar: ', error)
            req.flash('error', 'Usuário não cadastrado, tente novamente.')
            res.redirect('/users/register')
            return
        }
        req.flash("success", 'Registrado com sucesso, Faça o login')
        res.redirect('/users/login')

    })

}
exports.logout = (req, res) => {
    req.logout()
    res.redirect('/')
}

exports.profile = (req, res) => {
    res.render('profile')
}
exports.profileAction = async (req, res) => {
    try{
        const user = await  User.findOneAndUpdate(
            {_id: req.user._id},
            { name: req.body.name, email: req.body.email },
            { new: true, runValidators: true }
        )
        
    }catch(e) {
        req.flash('error', 'Erro ao editar o usuário: '+ e.message)
        res.redirect('/profile')
        return
    }
    req.flash('success', "Usuário editado com sucesso")
    res.redirect('/')
}

exports.forget = (req, res) => {
    res.render('forget')
}

exports.forgetAction = async(req, res) => {
    const user = await await User.findOne({email: req.body.email}).exec()
    if(!user) {
        req.flash('error', 'Email não cadastrado')
        res.redirect('/users/forget')
        return
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000
    
    await user.save()

    const resetLink = `http://${req.headers.host}/users/reset/${user.resetPasswordToken}`

    
    const text = `Testando e-mail com link: ${resetLink}`
    const html = `Testando email com link: <a href="${resetLink}">Resetar sua senha.</a>`
    // Enviar o link via email para o usuário.
    mailHandler.send({
        to: user.email,
        subject: 'Resetar sua senha',
        html,
        text
    })

    req.flash('success', 'Te enviamos um email com instruções')
    res.redirect('/users/login')
}

exports.forgetToken = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })
    if(!user) {
        req.flash('error', "Token Expirado")
        res.redirect('/users/forget')
        return
    }

    res.render('forgetPassword')
}

exports.forgetTokenAction = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }).exec()

    if(!user) {
        req.flash('error', "Token Expirado")
        res.redirect('/users/forget')
        return
    }
    if(req.body.password != req.body['password-confirm']) {
        req.flash('error', "As senhas não batem...")
        res.redirect('back')
        return
    }

    user.setPassword(req.body.password, async() => {
        await user.save()

        req.flash('success', 'Senha alterada com sucesso')
        res.redirect('/')
    })
}