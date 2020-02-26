const express = require('express');
const app = express();
const {
    imagesData,
    InsertUpload,
    singleImage,
    saveComment,
    comments
} = require('./db.js'); //?
const s3 = require('./s3');
const { s3Url } = require('./config.json'); //?

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

app.use(express.json());
//any routes are just for info/data

app.get('/images', (req, res) => {
    //this is going to be hooked up with the database
    imagesData().then(response => res.json(response));
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    //this is going to be hooked up with the database
    console.log('input', req.body, 'file', req.file);

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
    console.log('SingleImage', req.body);

    singleImage(req.body.id).then(response => {
        res.json({ response });
    });
    // res.sendStatus(200)
});

app.post('/comments', (req, res) => {
    //This will make a request to the database for the singleImage
    console.log('SingleImage', req.body);

    comments(req.body.id).then(response => {
        res.json({ response });
    });

    // singleImage(req.body.id).then(response=>{
    //     res.json({response})
    // })
    // res.sendStatus(200)
});

app.listen(8080, () => console.log('server is running'));
