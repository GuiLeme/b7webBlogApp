const mongoose = require('mongoose')
const Post = mongoose.model('Post')

exports.index = async (req, res) => {
    let objeto = {
        pageTitle: "HOME",
        posts: [],
        tags: [],
        tag: ''
    }
    

    objeto.tag = req.query.t
    let postFilter = (objeto.tag != undefined ? {tags: objeto.tag}: {})
    
    const tagsPromise = Post.getTagsList()
    const postsPromise = Post.findPosts(postFilter)
    
    const [tags, posts] = await Promise.all([tagsPromise, postsPromise])

    
    for (let i in tags) {
        if (tags[i]._id==objeto.tag){
            tags[i].class="selected"
        }
    }

    if(req.isAuthenticated()){
        posts.map(item => {
            item.mostrar = (JSON.stringify(item.author._id) == JSON.stringify(res.locals.user._id))
        })
    }

    objeto.tags = tags
    objeto.posts = posts

    res.render('home', objeto)
}