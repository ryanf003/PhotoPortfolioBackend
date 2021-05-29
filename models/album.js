const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumImgSchema = new Schema({
    image: {
        type: String,
        required: true
    }
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
        required: true,
        unique: true
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