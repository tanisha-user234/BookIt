import {Request} from 'express';


export interface UserPayload{
    id:number;
    email:string;
    role:'user'|'organizer';
}

//here customizing the request type that contain the user object
export interface AuthRequest extends Request{
    user?: UserPayload;
}