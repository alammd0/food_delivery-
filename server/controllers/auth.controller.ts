import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import sendEmail from "../utils/SendEmail";

export const signup = async (req : Request, res : Response) => {
    try {
        const { name, email, phoneNo, password } = req.body;

        if (!name || !email || !phoneNo || !password) {
            return res.status(400).json({
                message  : "Please provide all the required fields",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where : {
                email
            }
        });


        if (existingUser) {
            return res.status(400).json({
                message  : "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data : {
                name,
                email, 
                phoneNo,
                password : hashedPassword
            }
        });

        return res.status(201).json({
            message  : "User created successfully",
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

export const login = async (req : Request, res : Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message  : "Please provide email and password",
            });
        }

        const user = await prisma.user.findFirst({
            where : {
                email
            }
        })

        if(!user){
            return res.status(400).json({
                message : "User not found related to the email",
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({
                message : "Password is mismatched",
            })
        }

        // token generation
        const payload = {
            id : user.id,
            email : user.email,
            // role : user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn : "1week"
        })

        return res.status(200).json({
            message : "Login successful",
            token,
            user: {
                name : user.name,
                email : user.email,
                phoneNo : user.phoneNo,
                // role : user.role
            }
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

export const sendLinkByEmail = async (req :Request, res : Response) => {
    try{
        const { email } = req.body;

        if(!email){
            return res.status(400).json({
                message : "Please provide email",
            })
        }

        const user = await prisma.user.findFirst({
            where : {
                email
            }
        })

        if(!user){
            return res.status(400).json({
                message : "User not found related to the email",
            })
        }

        // token generation
        const payload = {
            id : user.id,
            email : user.email,
            // role : user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn : "1week"
        })

        const url = `${process.env.CLIENT_URL}/auth/update-password/${token}`

        const html = `<h1>Please click on the link to reset your password</h1> <a href="${url}">${url}</a>`

        const text = `if you are already update Your password then ignore this email`

        await sendEmail(user.email,  "Reset Password", html, text);

        return res.status(200).json({
            message : "Please check your email for the link to reset your password",
        })
    }
    catch (error) {
        res.status(500).json({
            message  : "Internal Server Error",
        });
      
  }
}

export const updatePassword = async (req : Request, res : Response) => {
   try {
       const { password, confirmPassword } = req.body;

       const token = req.params.token; 

       if(!token){
           return res.status(400).json({
               message : "Please provide token",
           })
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id : number, email : string };

       if(!decoded){
           return res.status(400).json({
               message : "Token is invalid",
           })
       }

       if(!password || !confirmPassword){
           return res.status(400).json({
               message : "Please provide password and confirm password",
           })
       }

       if(password !== confirmPassword){
           return res.status(400).json({
               message : "Password and confirm password does not match",
           })
       }

       const hashedPassword = await bcrypt.hash(password, 10);

       await prisma.user.update({
            where : {
                id : decoded.id
            }, 
            data : {
                password : hashedPassword
            }
       })

       return res.status(200).json({
           message : "Password updated successfully",
       })
   }
   catch (error) {
    return res.status(500).json({
           message  : "Internal Server Error",
       });
       console.log(error);
   }
   return;
}