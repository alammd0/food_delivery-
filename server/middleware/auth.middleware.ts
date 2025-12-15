import type  { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = async ( req : Request, res : Response, next : NextFunction) => {
    const token = req.headers.authorization as string;

    if(!token){
        return res.status(401).json({
            message : "Please provide token",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id : number, email : string };

        if(!decoded){
            return res.status(401).json({
                message : "Token is invalid",
            })
        }

        // @ts-ignore
        req.user = decoded;

        next();
    }
    catch (error) {
        return res.status(401).json({
            message : "Token is invalid",
        })
    }
}


export const isOwner = async (req : Request, res : Response, next : NextFunction) => {
    try{

    }
    catch (error) {
        return res.status(401).json({
            message : "Token is invalid",
        })
    }
}
