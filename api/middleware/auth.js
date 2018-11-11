// @flow
const jwt = require('jsonwebtoken');
import type { $Request, $Response } from 'express';

exports.checkAuth = (req: $Request, res: $Response, next: Function) => {
    try {
        const token: string = req.headers.authorization.split(" ")[1];
        const key: any = process.env.JWT_KEY;
        const decoded: Object = jwt.verify(token, key);
        req.userData = decoded;
        next();
    } catch(error) {
        return res.status(401).json({
            message: 'Authorization failed',
        });
    }
};

exports.withAuth = (req: $Request, res: $Response, next: Function) => {
    try {
        const token: string = req.headers.authorization.split(" ")[1];
        const key: any = process.env.JWT_KEY;
        const decoded: Object = jwt.verify(token, key);
        req.userData = decoded;
    } catch(error) {
        console.log("[WithAuth] ERROR: " + error);
    }
    next();
};