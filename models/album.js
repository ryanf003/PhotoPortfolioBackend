const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const albumImgSchema = new Schema({
    image: {
        type: String,
        required: true
    }, 
    comments: [commentSchema]
}, {
    timestamps: true
});

const albumSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    coverImg: {
        type: String,
    },
    featured: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date
    }, 
    images: [albumImgSchema]
}, {
    timestamps: true
});


const Album = mongoose.model('Album', albumSchema);
module.exports = Album;