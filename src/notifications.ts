import {Request, Response} from "express";
import * as admin from "firebase-admin";
export const sendNotification = async (
  request : Request,
  response : Response) => {
  const messageFromClient = request.body;
  const db = admin.firestore();
  const userRef = db.collection("users");
  const users = await userRef.get();
  const tokens = users.docs.map((doc)=>{
    const fcm = doc.data()["fcm"];
    return fcm;
  });
  const message = {
    notification: {
      title: messageFromClient.title,
      body: messageFromClient.body,
    },
    tokens: tokens,
  };
  admin.messaging().sendEachForMulticast(message);
  response.end();
};
