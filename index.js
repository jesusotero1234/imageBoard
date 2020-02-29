const express = require('express');
const app = express();
const {
    imagesData,
    InsertUpload,
    singleImage,
    saveComment,
    comments,
    getMoreImages,
    finished,
    allImages,
    imageUrlData,
    saveLikes,
    likesTable,
    likesTableforModal,
    deleteImage
} = require('./db.js'); //?
const s3 = require('./s3');
const { s3Url } = require('./config.json'); //?
const moment = require('moment');
const cookieSession = require('cookie-session');
const { v4 } = require('uuid');

app.use(express.static('public'));

//boiler PLate code
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(
    cookieSession({
        secret: 'super-secret-password',
        maxAge: 1000 * 60 * 60 * 24 * 14 //2 Weeks it will last the cookie, when it's over expire
    })
);

app.use(function(req, res, next) {
    if (!req.session.id) {
        req.session.id = v4();
        next();
    } else {
        next();
    }
});

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.json());
//any routes are just for info/data

app.get('/images', (req, res) => {
    //Create Cookie session and saves the Id

    ///Save the req.session in the database
    // saveUserID(req.session.id).then(()=>{}).catch(err=>console.log(err))

    //this is going to be hooked up with the database
    imagesData().then(response => res.json(response));
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    //this is going to be hooked up with the database
    // console.log('input', req.body, 'file', req.file);

    if (req.file) {
        const url = s3Url + req.file.filename;
        InsertUpload(
            url,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(() => {
                console.log('inserted in DB');
                res.json({
                    success: true,
                    newImage: {
                        url,
                        username: req.body.username,
                        title: req.body.title,
                        description: req.body.description
                    }
                });
            })
            .catch(err => console.log(err));
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/singleImage', (req, res) => {
    //This will make a request to the database for the singleImage

    singleImage(req.body.id).then(response => {
        res.json({ response });
    });
    // res.sendStatus(200)
});

app.post('/comments', (req, res) => {
    //This will make a request to the database for the singleImage
    // console.log('comments', req.body);

    comments(req.body.id).then(response => {
        // console.log('response from comments',response)
        let obj = [];
        //Converting dates with moment
        response.rows.forEach(
            ({ comment, created_at, id, image_id, username }) => {
                created_at = moment(created_at, 'YYYYMMDD').fromNow();

                obj.push({
                    comment,
                    created_at,
                    id,
                    image_id,
                    username
                });
            }
        );
        // console.log('check new obj', obj);
        res.json({ obj });
    });
});

app.post('/saveComment', (req, res) => {
    //This will make a request to the database for the singleImage
    // console.log('saveComment', req.body);

    saveComment(
        req.body.usernameFromComment,
        req.body.comment,
        req.body.id
    ).then(() => {
        comments(req.body.id).then(response => {
            let obj = [];
            //Converting dates with moment
            response.rows.forEach(
                ({ comment, created_at, id, image_id, username }) => {
                    created_at = moment(created_at, 'YYYYMMDD').fromNow();

                    obj.push({
                        comment,
                        created_at,
                        id,
                        image_id,
                        username
                    });
                }
            );
            // console.log('check new obj', obj);
            res.json({ obj });
        });
    });
});

app.get('/getMoreImages/:id', (req, res) => {
    // console.log('params',req.params.id)
    //this is going to be hooked up with the database
    getMoreImages(req.params.id).then(response => {
        finished(req.params.id).then(resp1 => {
            res.json({
                response,
                resp1
            });
        });
    });
});

app.get('/imagesId', (req, res) => {
    //this is going to be hooked up with the database
    allImages().then(response => res.json(response));
});

app.get('/seeLikes/:id', (req, res) => {
    // console.log("req.params",req.params)
    console.log(req.session.id, req.params.id);
    //this is going to be hooked up with the database
    likesTable(req.session.id, req.params.id).then(response => {
        if (response.length == 0) {
            imageUrlData(req.session.id, req.params.id)
                .then(response => {
                    likesTable(req.session.id, req.params.id).then(response =>
                        res.json({ response })
                    );
                })
                .catch(err => {
                    console.log(err);
                    likesTable(req.session.id, req.params.id).then(response =>
                        res.json({ response })
                    );
                });
        } else {
            likesTable(req.session.id, req.params.id).then(response =>
                res.json({ response })
            );
        }
    });
});

app.post('/updateLikeFromUser', (req, res) => {
    console.log('updateLike', req.body, 'hello');

    saveLikes(
        req.body.liked,
        req.body.disliked,
        req.session.id,
        req.body.imageID
    )
        .then(() => {})
        .catch(err => console.log(err));
    // seeLikes(req.session.id).then(response => res.json(response));
});

app.get('/likesTable/:id', (req, res) => {
    //this is going to be hooked up with the database
    likesTableforModal(req.params.id).then(response => res.json(response));
});

app.post('/deleteImg2', s3.deleteAWS, (req, res) => {
    console.log('delete part',req.body)
    deleteImage(req.body.url)
        .then(() => {
            
        imagesData().then(resp =>res.json({resp}))
        })
        .catch(err => console.log(err));
});

app.listen(8080, () => console.log('server is running'));
