const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens')

// Middleware para parsear o corpo das requisições
router.use(express.urlencoded({ extended: true }));
router.use(express.json())


router.get('/post', (req, res) => {
    res.send('pagina de posts');
})

router.get('/categorias', (req, res) => {

    Categoria.find().lean().then((categorias)=>{
    res.render('admin/categorias', {categorias:categorias})
    
    }).catch((err)=>{
        req.flash('error_msg', "Houve um erro ao listar")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addCategoria')
})

router.post('/categorias/nova', (req, res) => {
    let erros = []

    if (!req.body.nome || typeof req.body.nome === 'undefined' || req.body.nome === null) {
        erros.push({ text: 'Nome inválido' })
    }

    if (!req.body.slug || typeof req.body.slug === 'undefined' || req.body.slug === null) {
        erros.push({ text: 'Slug inválido' })
    }

    if (req.body.nome.length < 2) {
        erros.push({ text: 'Nome da categoria é muito pequeno' })
    }

    if (erros.length > 0) {
        res.render('admin/addCategoria', { erros: erros })
    } 
    
    else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
            date: req.body.date
        }

        new Categoria(novaCategoria)
            .save()

            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso")
                res.redirect('/admin/categorias')
            })

            .catch(() => {
                req.flash("error_msg", "Aconteceu um erro ao salvar a categoria, tente novamente!")
                res.redirect('/admin')
            })
    }
})

router.get('/categorias/edit/:id', (req,res) =>{

    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria:categoria})

    }).catch((err)=>{
        req.flash("Esta categoria nao existe")
        res.redirect('/admin/categorias')
        })
    
})

router.post("/categorias/edit", (req,res)=>{

    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(()=>{
        req.flash("success_msg", "Categoria editada com sucesso!")
        res.redirect("/admin/categorias")

    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao editar a categoria!")
        res.redirect("/admin/categorias")

    })

    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
        })
})

router.post('/categorias/deletar', (req,res)=>{

    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria removida com sucesso!")
        res.redirect("/admin/categorias")

    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao remover a categoria")
        res.redirect("/admin/categorias")
    })
})

    router.get('/postagens', (req, res) => {
    
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('admin/postagens', {postagens: postagens})
    
        }).catch( (err) => {
            req.flash('error_msg', 'Erro ao listar os posts')
            res.render('/admin')
        })
    })


router.get("/postagens/add", (req,res)=>{

    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addpostagem', {categorias:categorias})

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin/addpostagem")
    })
})

router.post("/postagens/nova", (req,res)=>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria invalida, registre uma categoria!"})
    }

    if(erros.length >0){
        Categoria.find().lean().then((categorias) =>{
         res.render("admin/addpostagens",{erros:erros, categorias:categorias})
        })     
    }

    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            conteudo:req.body.conteudo,
            descricao: req.body.descricao,
            categoria:req.body.categoria,
            slug:req.body.slug
        }

        new Postagem(novaPostagem).save().then(() =>{
            req.flash('success_msg', 'Postagem criada com sucesso')
            res.redirect('/admin/postagens')

        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect('/admin/postagens')
        })

    }
})



router.get("/postagens/edit/:id", (req,res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

        Categoria.find().lean().then((categorias) => {
        res.render('admin/editpostagens', {categorias:categorias, postagem: postagem}) 

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar as postagens')
            res.redirect('/admin/categorias')

        })

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario  de edição")
        res.redirect('/admin/categorias')
    })
})

router.post('/postagem/edit', (req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((Postagem)=>{
        
        Postagem.titulo = req.body.titulo
        Postagem.slug = req.body.slug
        Postagem.descricao = req.body.descricao
        Postagem.conteudo = req.body.conteudo
        Postagem.categoria = req.body.categoria

        Postagem.save().then(()=>{
            req.flash("success_msg", 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')

        }).catch((err)=>{
            req.flash('error_msg', "Erro interno")
            res.redirect('/admin/postagens')
            console.log(err)
        })

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect('/admin/postagens')
        console.log(err)
    })
})

router.get('/postagens/deletar/:id', (req,res)=> {
    Postagem.deleteOne({_id: req.params.id}).lean().then(() =>{
        req.flash("success_msg", 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', "Erro interno")
        res.redirect('/admin/postagens')

    })
})

module.exports = router;
