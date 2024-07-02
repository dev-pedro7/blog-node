const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo:{
        type:String
        
    },
    slug:{
        type:String
        
    },
    descricao:{
        type:String
        
    },
    conteudo:{
        type:String
        
    },
    categoria:{
        type:Schema.Types.ObjectId,
        ref:"categorias"
    
    },
    data:{
    type:Date,
        default:Date.now()
    }
})

mongoose.model("postagens", Postagem)