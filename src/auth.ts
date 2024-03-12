import {Request, Response} from "express";
import {verifyAdmin} from "./database";
import * as jwt from "jsonwebtoken";

const generateJWT =(email :string) =>{
  const secretKey = process.env.JWT_SECRET as string;
  return jwt.sign(email, secretKey);
};

export const authorization = async (req : Request, res : Response)=>{
  const query = req.query;
  const email = query["email"] as string;
  const isAdmin =await verifyAdmin(email);
  let token ="";
  if (isAdmin) {
    token = generateJWT(email);
  }
  res.json({isAdmin, token});
};

