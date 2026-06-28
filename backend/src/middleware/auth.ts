import { Response,NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest,UserPayload } from "../types";
import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

//this middleware checks the presence and validity of the token

export const authenticate=(req:AuthRequest,res:Response,next:NextFunction)=>{
    let token:string|null=null;

    //check if the token is attached to the headers
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        token= req.headers.authorization.split(' ')[1];
    }

    //try to read the token from the cookie
   else if(req.cookies && req.cookies.token){
        token = req.cookies.token;
    }

    //if no token provided ,reject the request
    if(!token){
        console.error("NO token provided")
        return res.status(401).json({error:'Access denied. No token provided'})
    }
    //now validating the token
    try {
        const decodedToken =  jwt.verify(token,JWT_SECRET) as UserPayload;
        req.user=decodedToken;
        next();
    } catch (error) {
        //this means we got the token but validation fails
        console.error("Tolen validation failed");
        return res.status(401).json({error:'Invalid or expired token.'})
    }
}

// this middleware is to assign the access based on roles
export const authorize=(roles:string|string[])=>{
    const allowedRoles = typeof roles === 'string'?[roles]:roles;

    return (req:AuthRequest,res:Response,next:NextFunction)=>{
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({error:'Acess denied. Unauthorized role'});
        }
        next();
    }
}
