import {Request, Response} from "express";
import {verifyAdmin} from "./database";
import * as jwt from "jsonwebtoken";

const generateJWT =(email :string) =>{
  const secretKey = process.env.JWT_SECRET as string;
  return jwt.sign(email, secretKey);
};

export const authenticateToken = async (
  req : Request, res : Response, next : any) => {
  if ( req.path == "/auth") return next();
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader;
  if (token == null) return res.sendStatus(401);
  const secretKey = process.env.JWT_SECRET as string;
  try {
    const verified = jwt.verify(token, secretKey);
    console.log(verified);
    await next();
  } catch (error) {
    console.log(error);
  }
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

