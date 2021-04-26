const mongoose = require("mongoose")
mongoose.Promise = global.Promise
const slug = require('slug')

const postSchema = new mongoose.Schema({
    photo: String,
    title: {
        type: String,
        trim: true,
        required: "O post precisa de um título"
    }, 
    slug: String,
    body: {
        type: String,
        trim: true,
        required: "O post precisa ter um corpo"
    },
    tags: [String]
})

postSchema.pre('save', function(next){
    if (this.isModified('title')){
        this.slug = slug(this.title, {lower: true, trim: true})
    }
    
    next()
})

module.exports = mongoose.model("Post", postSchema)