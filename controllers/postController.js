const mongoose = require('mongoose')
const { stringify } = require('uuid')
const Post = mongoose.model('Post') 

exports.add = (req, res) => {
    res.render("postAdd")
}

exports.addAction = async(req, res) => {
    req.body.tags = req.body.tags.split(',').map(t => t.trim())
    req.body.author = req.user._id
    
    const post = new Post(req.body)
    try{
        if (!req.body.title || !req.body.body){
            throw {message:"Não foi preenchido algum dos campos"}
        }
        
        await post.save()
    }catch(error){
        req.flash('error', 'Erro: '+error.message)
        return res.redirect('/post/add')
    }

    req.flash('success', 'Post salvo com sucesso!')
    res.redirect('/')
}

exports.edit = async (req, res) => {
    const post = await Post.findOne({slug: req.params.slug})
    res.render('postEdit', { post })
}

exports.editAction = async (req, res) => {
    req.body.slug = require('slug')(req.body.title, {lower: true, trim: true})
    
    req.body.tags = req.body.tags.split(',').map(t=>t.trim())
    console.log(req.body.tags)
    try{
        const post = await Post.findOneAndUpdate(
            {slug: req.params.slug}, 
            req.body, 
            {
                new:true,
                runValidators:true
            }  
            
        )
    }catch(error){
        req.flash('error', 'Erro: '+error.message)
        return res.redirect(`/post/${req.params.slug}/edit`)
    }
    req.flash('success', "Post atualizado com sucesso")
    res.redirect('/')
}

exports.view = async(req, res) => {
    const post = await Post.findOne({slug: req.params.slug})


    res.render('view', {post})
}

exports.remove = async (req, res) => {
    try{
        await Post.deleteOne({slug: req.params.slug})
        req.flash('success', "Post Deletado com sucesso")

        res.redirect('/')
    }catch(e){
        req.flash('error', "Não consegui deletar o post: " + e.message)
        redirect('/')
    }
    
    
}

exports.canEdit = async (req, res, next) => {
    const post = await Post.findOne({slug: req.params.slug})
    if ((JSON.stringify(post.author) != JSON.stringify(req.user._id))) {
        req.flash('error', 'Você não é o autor desse post')
        res.redirect('/')
        return
    }
    next()

}