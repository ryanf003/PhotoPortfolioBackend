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

albumRouter.route(':albumId/comments')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(album.comments);
        } else {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album) {
            album.comments.push(req.body);
            album.save()
            .then(album => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(album);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /albums/${req.params.albumId}/comments`);
})
.delete((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album) {
            for (let i = (album.comments.length-1); i >= 0; i--) {
                album.comments.id(album.comments[i]._id).remove();
            }
            album.save()
            .then(album => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(album);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

albumRouter.route('/:albumId/:imageId/comments/:commentId')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(album.comments.id(req.params.commentId));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /albums/${req.params.albumId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.comments.id(req.params.commentId)) {
            if (req.body.rating) {
                album.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.text) {
                album.comments.id(req.params.commentId).text = req.body.text;
            }
            album.save()
            .then(album => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(album);
            })
            .catch(err => next(err));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.comments.id(req.params.commentId)) {
            album.comments.id(req.params.commentId).remove();
            album.save()
            .then(album => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(album);
            })
            .catch(err => next(err));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});


module.exports = albumRouter;