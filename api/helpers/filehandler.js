const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// AWS
const ENDPOINT_URL = process.env.IMAGE_ENDPOINT || 'ams3.digitaloceanspaces.com';
const spacesEndpoint = new aws.Endpoint(ENDPOINT_URL);
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

/* const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + file.originalname);
    },
}); */

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET || 'sys-ut-news-space',
        acl: 'public-read',
        key: (request, file, cb) => {
            console.log(file);
            cb(null, new Date().getTime() + file.originalname);
        }
    }),
    limit: {
        fileSize: 1024*1024*5, 
    },
    fileFilter: fileFilter,
});

module.exports = {
    upload: upload,
    multer: multer,
}