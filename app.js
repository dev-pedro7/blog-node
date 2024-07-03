// Load models
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model('postagens')

// Configurações
    //Sessao
    app.use(session({
        secret: "cursoNode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    
    //Middleware
    app.use((req,res,next) =>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

    // BodyParser
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

    //HandleBars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

    // Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log('Conectado ao mongoDB')
    }).catch((err) => {console.log('Ocorreu algum erro ao se conectar' + err)})

    //Public
    app.use(express.static('public'));

    /*app.use((req,res, next) => {
        console.log('Midleware: requisição feita')
        next()
    })
*/
// Rotas
app.get('/', (req, res) => {
    res.render('index')
})


app.use('/admin', admin)

//Outros
const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log('Server rodando')
})
