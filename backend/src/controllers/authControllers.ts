import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { error } from 'console';
import { json } from 'stream/consumers';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';


//controller function to handle the signup
export const signup =  async (req:Request,res:Response)=>{
    const {email,password, role}=req.body;
    if(!email || !password){
        return res.status(400).json({error:'Email and password are required'});
    }

    if(role && !['user','organizer'].includes(role)){
        return res.status(400).json({error:'Invalid role'})
    }
    try {
        //registering the user with email and password
        //check if that email already exist?
    const isEmailExist= await db.raw('SELECT id from users where email =?',[email]);
    if(isEmailExist.rows.length>0){
        return res.status(409).json({error:'Email already registered'})
    }
    const passwordHash= await bcrypt.hash(password,10);

    //now insert the user email and password in db
    const insertResult = await db.raw('INSERT into users(email,password_hash,role) VALUES (?, ?, ?) RETURNING id, email, role',[email,passwordHash,role||'user']);
    const user = insertResult.rows[0];

    //create jwt
    const token = jwt.sign(
      {id:user.id, email:user.email,role:user.role},
      JWT_SECRET,
      {expiresIn:'24h'}
    );

    //set cookie
    res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict',
        maxAge:24*60*60*1000
    });
    return res.status(201).json({user,token})
    } catch (error) {
        console.error("Signup error",error);
        res.status(500).json({error:"Onternak server error"});
    }
};

export const login= async (req:Request, res:Response)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({error:'Email and password are required'})
    }

    try {
        const result= await db.raw('SELECT * From users where email = ?',[email]);
        const user = result.rows[0];
        if(!user){
            return res.status(404).json({error:'User not found'})
        }
        //verify the hash password if the user exists
        const isMatch= await bcrypt.compare(password,user.password_hash);
        if(!isMatch){
            return res.status(401).json({error:'I nvalid credentials'});
        }

        //since the password is matched 
        //generate the token
        const token= jwt.sign(
            {id:user.id, email:user.email,role: user.role},
            JWT_SECRET,
            {expiresIn:'24h'}
        )

        //set the cookie
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge: 24*60*60*1000
        });

        return res.status(200).json({
            user:{id:user.id,email:user.email,role:user.role},
            token
        })
    } catch (error) {
        console.error('Login error',error);
        return res.status(500).json({error:'Internal server error'})
    }
};

// logout
export const logout = (req:Request, res:Response)=>{
    res.clearCookie('token');
    return res.status(200).json({message:'Logged out successfully'});
}