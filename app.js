const express = require('express')
const mustache = require('mustache-express')
const helpers = require('./helpers')
const errorHandler = require('./handlers/errorHandler')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')
const session = require('express-session')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

//importando as rotas
const adminRouter = require('./routes/admin')
const router = require('./routes/index')

//configurações:
app = express()

app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser(process.env.SECRET))
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:false
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())


const User = require('./models/User')
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    res.locals.h = {...helpers}
    res.locals.flashes = req.flash()
    res.locals.user = req.user


    if (req.isAuthenticated()) {
        res.locals.h.menu = res.locals.h.menu.filter((item) => {
            return item.logged 
        })
    } else {
        res.locals.h.menu = res.locals.h.menu.filter((item) => {
            return item.guest
        })
    }
    
    next()
})



//view
app.engine("mst", mustache(__dirname + '/views/partials', '.mst'))
app.set('view engine', 'mst')
app.set('views', __dirname + '/views')



//rotas sendo usadas
app.use('/admin', adminRouter)
app.use('/', router)

app.use(errorHandler.notFound)

module.exports = app