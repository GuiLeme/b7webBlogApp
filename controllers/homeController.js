const mongoose = require("mongoose")
const Post = mongoose.model('Post')



exports.index = async (req, res) => {
    objeto = {
        pageTitle: "HOME",
    }

    const posts = await Post.find()
    objeto.posts = posts

    res.render('home', objeto)
}