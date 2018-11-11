// @flow 
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
import type {Multer} from 'multer';

// AWS
const ENDPOINT_URL: string = process.env.IMAGE_ENDPOINT || 'ams3.digitaloceanspaces.com';
const spacesEndpoint: aws.Endpoint = new aws.Endpoint(ENDPOINT_URL);
const s3: aws.S3 = new aws.S3({
    endpoint: spacesEndpoint
});

const fileFilter: Function = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload: Multer = multer({
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