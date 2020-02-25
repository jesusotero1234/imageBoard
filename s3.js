const aws = require('aws-sdk');
const fs = require('fs');
const {s3Url} = require('./config.json')//?

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {

    if(!req.file){
        console.log('no file')
        return res.sendStatus(500)
    }

    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: 'spicedling',
            ACL: 'public-read',
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size
        })
        .promise();

    promise
        .then(() => {
            // it worked!!!
            console.log('The image has been uploaded to Amazon')
            console.log('Amazon Path',s3Url+req.file.filename)
            next()
            //fs.unlink(path,()=>{}) remove from the upload folder 
        })
        .catch(err => {
            // uh oh
            console.log('Error un PutObject (S3)',err);
            res.sendStatus(500)
        });
};
