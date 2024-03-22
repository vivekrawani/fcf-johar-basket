import {Request, Response} from "express";
import * as admin from "firebase-admin";
type NotificationMessage = {
  message : {
    title : string;
    body: string;
  };
  author : {
    name : string;
    email : string;
  };
  date : Date;
}
const saveNotificationToDb = async (db : admin.firestore.Firestore,
  notification : NotificationMessage)=> {
  const notificationRef = db.collection("notifications");
  await notificationRef.add(notification);
};
export const sendNotification = async (
  request : Request,
  response : Response) => {
  response.set("Access-Control-Allow-Origin", "*");
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
  const notificationDb = {
    message: {
      title: messageFromClient.title,
      body: messageFromClient.body,
    },
    date: new Date(),
    author: {
      name: messageFromClient.author.name,
      email: messageFromClient.author.email,
    },
  };
  saveNotificationToDb(db, notificationDb);
  admin.messaging().sendEachForMulticast(message);
  response.end();
};

export const sendNotificationToAdmin = async (
  title : string,
  body:string
)=>{
  const db = admin.firestore();
  const userRef = db.collection("admin");
  const users = await userRef.get();
  const tokens = users.docs.map((doc)=>{
    const fcm = doc.data()["fcm"];
    return fcm;
  });
  const message = {
    notification: {
      title,
      body,
    },
    tokens: tokens,
  };
  admin.messaging().sendEachForMulticast(message);
};
