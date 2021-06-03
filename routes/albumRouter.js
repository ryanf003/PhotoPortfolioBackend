const express = require('express');
const Album = require('../models/album');
const authenticate = require('../authenticate');

const albumRouter = express.Router();

albumRouter.route('/')
.get((req, res, next) => {
    Album.find()
    .populate('comments.author')
    .then(albums => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(albums);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Album.create(req.body)
    .then(album => {
        console.log('Album Created ', album);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(album);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /albums');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .populate('comments.author')
    .then(album => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(album);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /albums/${req.params.albumId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Album.findByIdAndDelete(req.params.albumId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

//route displays images in album
albumRouter.route(':albumId/images')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(album.images);
        } else {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /albums/${req.params.albumId}/comments`);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album) {
            for (let i = (album.images.length-1); i >= 0; i--) {
                album.images.id(album.images[i]._id).remove();
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

albumRouter.route(':albumId/images/:imageId')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(album.images.id(req.params.imageId));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Image ${req.params.imageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /albums/${req.params.albumId}/images/${req.params.imageId}`);
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /albums/${req.params.albumId}/images/${req.params.imageId}`);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId)) {
            album.images.id(req.params.imageId).remove();
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
            err = new Error(`Comment ${req.params.imageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

albumRouter.route('/:albumId/images/:imageId/comments')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .populate('comments.author')
    .then(album => {
        if(album && album.images.id(req.params.imageId)){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            //send json data to client in res & close res stream
            res.json(album.images.id(req.params.imageId).comments);
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Image ${req.params.imageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    //pass err to the overall error handler for express application
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId)) {
            req.body.author = req.user._id;
            album.images.id(req.params.imageId).comments.push(req.body);
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
            err = new Error(`Image ${req.params.imageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /albums/images/${req.params.imageId}/comments`);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if(album && album.images.id(req.params.imageId)){
            for (let i = (album.images.id(req.params.imageId).comments.length-1); i >= 0; i--) {
                album.images.id(req.params.imageId).comments.id(album.images.comments[i]._id).remove();
            }
            album.save()
            .then(album => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                //send json data to client in res & close res stream
                res.json(album.images.id(req.params.imageId).comments);
            })
            .catch(err => next(err));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Image ${req.params.imageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

albumRouter.route('/:albumId/images/:imageId/comments/:commentId')
.get((req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId) && album.images.id(req.params.imageId).comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(album.images.id(req.params.imageId).comments.id(req.params.commentId));
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else if (!album.images.id(req.params.imageId)) {
            err = new Error(`Image ${req.params.imageId} not found`);
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
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /albums/${req.params.albumId}/images/${req.params.imageId}/comments/${req.params.commentId}`);
})
//need to match authors
.put(authenticate.verifyUser, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId) && album.images.id(req.params.imageId).comments.id(req.params.commentId)) {
            if(req.user._id.equals(album.images.id(req.params.imageId).comments.id(req.params.commentId).author._id)) {
                if (req.body.rating) {
                    album.images.id(req.params.imageId).comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    album.images.id(req.params.imageId).comments.id(req.params.commentId).text = req.body.text;
                }
                album.save()
                .then(album => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(album);
                })
                .catch(err => next(err));
            } else { 
                err = new Error('You are not authorized to modify this comment');
                err.statusCode = 403;
                return next(err);
            }
        } else if (!album) {
            err = new Error(`Album ${req.params.albumId} not found`);
            err.status = 404;
            return next(err);
        } else if (!album.images.id(req.params.imageId)) {
            err = new Error(`Image ${req.params.imageId} not found`);
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Album.findById(req.params.albumId)
    .then(album => {
        if (album && album.images.id(req.params.imageId) && album.images.id(req.params.imageId).comments.id(req.params.commentId)) {
            album.images.id(req.params.imageId).comments.id(req.params.commentId).remove();
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
        } else if (!album.images.id(req.params.imageId)) {
            err = new Error(`Image ${req.params.imageId} not found`);
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