const express = require('express');
const Album = require('../models/album');

const albumRouter = express.Router();

albumRouter.route('/')
.get((req, res, next) => {
    Album.find()
    .then(albums => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(albums);
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    Album.create(req.body)
    .then(album => {
        console.log('Album Created ', album);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(album);
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /albums');
})
.delete((req, res, next) => {
    Album.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

albumRouter.route('/:albumId')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(album);
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /albums/${req.params.albumId}`);
})
.put((req, res, next) => {
    Album.findByIdAndUpdate(req.params.albumId, {
        $set: req.body
    }, { new: true })
    .then(album => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(album);
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Album.findByIdAndDelete(req.params.albumId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = albumRouter;