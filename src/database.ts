/* eslint-disable linebreak-style */
import * as admin from "firebase-admin";
admin.initializeApp();
import {Request, Response} from "express";
import type {OrderDetails} from "./types";
import {Readable} from "stream";
export const getNewOrders = async (request: Request, response: Response) => {
  const db = admin.firestore();
  const newOrdersRef = db.collection("orders").doc("newOrders");
  const orders: OrderDetails[] = [];
  const snap = await newOrdersRef.listCollections();
  for (let i = 0; i < snap.length; i++) {
    const element = snap[i];
    const subRef = newOrdersRef.collection(element.id);
    const subCollections = await subRef.listDocuments();
    const orderId = element.id;
    const len = subCollections.length;
    const ref = await subCollections[len - 1].get();
    const data = (await subRef.doc(ref.id).get()).data();
    const userName = data?.userName;
    const mobileNumber = data?.mobileNumber;
    const address = data?.address;
    const pincode = data?.pincode;
    const amount = data?.amount;
    const isAccepted = data?.isAccepted;
    const isDelivered = data?.isDelivered;
    const payment = data?.payment;
    const gst = data?.gst;
    const time = data?.time;
    const orderTime = data?.orderTime.toDate();
    const userId = data?.userId;
    const orderAcceptTime = data?.orderAcceptTime?.toDate();
    const deliverTime = data?.deliverTime?.toDate();
    const Order: OrderDetails = {
      userName,
      mobileNumber,
      address,
      pincode,
      amount,
      isAccepted,
      isDelivered,
      payment,
      orderId,
      gst,
      time,
      orderTime,
      userId,
      orderAcceptTime,
      deliverTime,
    };

    orders.push(Order);
  }
  response.send(orders);
};

export const getPastOrders = async (request: Request, response: Response) => {
  const db = admin.firestore();
  const newOrdersRef = db.collection("orders").doc("pastOrders");
  const orders: OrderDetails[] = [];
  const snap = await newOrdersRef.listCollections();
  for (let i = 0; i < snap.length; i++) {
    const element = snap[i];
    const subRef = newOrdersRef.collection(element.id);
    const subCollections = await subRef.listDocuments();
    const orderId = element.id;
    const len = subCollections.length;
    const ref = await subCollections[len - 1].get();
    const data = (await subRef.doc(ref.id).get()).data();
    const userName = data?.userName;
    const mobileNumber = data?.mobileNumber;
    const address = data?.address;
    const pincode = data?.pincode;
    const amount = data?.amount;
    const isAccepted = data?.isAccepted;
    const isDelivered = data?.isDelivered;
    const payment = data?.payment;
    const gst = data?.gst;
    const time = data?.time;
    const orderTime = data?.orderTime.toDate();
    const userId = data?.userId;
    const orderAcceptTime = data?.orderAcceptTime?.toDate();
    const deliverTime = data?.deliverTime?.toDate();
    const Order: OrderDetails = {
      userName,
      mobileNumber,
      address,
      pincode,
      amount,
      isAccepted,
      isDelivered,
      payment,
      orderId,
      gst,
      time,
      orderTime,
      userId,
      orderAcceptTime,
      deliverTime,
    };

    orders.push(Order);
  }
  response.send(orders);
};

const sendPushMessage = async (token: string, title: string, body: string) => {
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };
  const messaging = admin.messaging();
  await messaging.send(message);
};

const moveOrderToPastOrderUser = async (orderId: string, userId: string) => {
  const db = admin.firestore();
  const userOrderRef = db
    .collection("users")
    .doc(userId)
    .collection("order")
    .doc("myOrders")
    .collection(orderId);

  const targetCollection = db
    .collection("users")
    .doc(userId)
    .collection("order")
    .doc("pastOrder")
    .collection(orderId);

  userOrderRef
    .get()
    .then((qs: any) => {
      qs.forEach((doc: any) => {
        const data = doc.data();
        targetCollection
          .doc(doc.id)
          .set(data)
          .then(() => {
            console.log("Document copied");
            userOrderRef
              .doc(doc.id)
              .delete()
              .then(() => {
                console.log("Deleted");
              });
          })
          .catch((er) => {
            console.log("Cant copy", er);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
const moveOrderToPastOrderGlobal = async (orderId: string) => {
  const db = admin.firestore();
  const globalOrderRef = db
    .collection("orders")
    .doc("newOrders")
    .collection(orderId);

  const targetCollection = db
    .collection("orders")
    .doc("pastOrders")
    .collection(orderId);
  globalOrderRef
    .get()
    .then((qs) => {
      qs.forEach((doc) => {
        const data = doc.data();
        targetCollection
          .doc(doc.id)
          .set(data)
          .then(() => {
            console.log("Document copied");
            globalOrderRef
              .doc(doc.id)
              .delete()
              .then(() => {
                console.log("Deleted");
              });
          })
          .catch((er) => {
            console.log("Cant copy", er);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const acceptOrder = async (
  orderId: string,
  otp: string,
  deliveryTime: string,
  userId: string
) => {
  const db = admin.firestore();
  const userOrderRef = db
    .collection("users")
    .doc(userId)
    .collection("order")
    .doc("myOrders")
    .collection(orderId);
  const globalOrderRef = db
    .collection("orders")
    .doc("newOrders")
    .collection(orderId);
  const userOrder = await userOrderRef.doc("orderDetails").get();
  const globalOrder = await globalOrderRef.doc("orderDetails").get();
  const orderAcceptTime = new Date();
  if (userOrder.exists) {
    userOrderRef.doc("orderDetails").update({
      isAccepted: true,
      time: deliveryTime,
      orderAcceptTime,
      otp,
    });
  }
  if (globalOrder.exists) {
    globalOrderRef.doc("orderDetails").update({
      isAccepted: true,
      time: deliveryTime,
      orderAcceptTime,
      otp,
    });
  }
  // FCM
  const fcmSnap = await db.collection("users").doc(userId).get();
  const fcmToken = fcmSnap.get("fcm");
  await sendPushMessage(
    fcmToken,
    "Order Accepted",
    "Your Order has been accepted"
  );

  return {message: "success"};
};

const confirmOrder = async (userId: string, orderId: string, otp: string) => {
  const db = admin.firestore();
  const userOrderRef = db
    .collection("users")
    .doc(userId)
    .collection("order")
    .doc("myOrders")
    .collection(orderId);
  const globalOrderRef = db
    .collection("orders")
    .doc("newOrders")
    .collection(orderId);

  const orderRef = await userOrderRef.doc("orderDetails").get();
  const gOrderRef = await globalOrderRef.doc("orderDetails").get();

  const details = (await globalOrderRef.doc("orderDetails").get()).data();
  const res = {
    message: "",
    error: false,
  };
  if (details?.otp === otp) {
    res.message = "Order Delivered";
    const deliverTime = new Date();
    if (orderRef.exists) {
      userOrderRef.doc("orderDetails").update({
        isDelivered: true,
        payment: true,
        deliverTime,
      });
    }
    if (gOrderRef.exists) {
      globalOrderRef.doc("orderDetails").update({
        isDelivered: true,
        payment: true,
        deliverTime,
      });
    }

    moveOrderToPastOrderUser(orderId, userId);
    moveOrderToPastOrderGlobal(orderId);

    const fcmSnap = await db.collection("users").doc(userId).get();
    const fcmToken = fcmSnap.get("fcm");
    await sendPushMessage(
      fcmToken,
      "Order Delivered",
      "Your order has been delivered"
    );
    return {message: "success"};
  } else {
    res.message = "OTP did not match";
    res.error = true;
    return res;
  }
};

import {OrderAction, generateOTP} from "./utils";
export const updateOrder = async (req: Request, res: Response) => {
  const body = await req.body;
  const orderId = req.params.orderId;
  const updateType = body.updateType as OrderAction;
  const otp = body.otp as string;
  const date = body.date as string;
  const userId = body.userId as string;
  res.set("Access-Control-Allow-Origin", "*");
  try {
    if (updateType == OrderAction.ACCEPT_ORDER) {
      const otp = generateOTP(6);
      const result = await acceptOrder(orderId, otp, date, userId);
      res.send(result);
    } else if (updateType === OrderAction.CONFIRM_ORDER) {
      const result = await confirmOrder(userId, orderId, otp);
      res.send(result);
    }
  } catch (error) {
    res.status(500).json();
  }
};

export const streamData = async (req : Request, res :Response)=> {
  console.log("====================================");
  console.log("Stream");
  console.log("====================================");
  const db = admin.firestore();
  const newOrders = await db.collection("orders").doc("newOrders")
    .listCollections();
  const n = newOrders.length;
  let i = 0;
  const readableStream = new Readable({
    async read(size) {
      for (const order of newOrders) {
        i++;
        const subCollections = await order.listDocuments();
        const orderId = order.id;
        const len = subCollections.length;
        const ref = await subCollections[len - 1].get();
        const data = (await order.doc(ref.id).get()).data();
        const userName = data?.userName;
        const mobileNumber = data?.mobileNumber;
        const address = data?.address;
        const pincode = data?.pincode;
        const amount = data?.amount;
        const isAccepted = data?.isAccepted;
        const isDelivered = data?.isDelivered;
        const payment = data?.payment;
        const gst = data?.gst;
        const time = data?.time;
        const orderTime = data?.orderTime.toDate();
        const userId = data?.userId;
        const orderAcceptTime = data?.orderAcceptTime?.toDate();
        const deliverTime = data?.deliverTime?.toDate();
        const Order: OrderDetails = {
          userName,
          mobileNumber,
          address,
          pincode,
          amount,
          isAccepted,
          isDelivered,
          payment,
          orderId,
          gst,
          time,
          orderTime,
          userId,
          orderAcceptTime,
          deliverTime,
        };
        this.push(JSON.stringify(Order));
        if (i === n) {
          console.log(Order.orderId);
          this.push(null);
        }
      }
      this.push(null);
    },
  }
  );
  readableStream.pipe(res);
};
