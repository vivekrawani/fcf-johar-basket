import {getOrdersFromDb,
  confirmOrder,
  acceptOrder,
  moveOrderToCancelledOrders,
  moveOrderToCancelledOrdersGlobal} from "./database";
import {Request, Response} from "express";
import {OrderAction, generateOTP} from "./utils";
import {sendNotificationToAdmin} from "./notifications";
export const getNewOrders = async (_req :Request, res :Response)=>{
  const orders = await getOrdersFromDb("newOrders");
  res.json(orders);
};

export const getPastOrders = async (_req :Request, res :Response)=>{
  const orders = await getOrdersFromDb("pastOrders");
  res.json(orders);
};

export const updateOrder = async (req : Request, res : Response)=>{
  res.set("Access-Control-Allow-Origin", "*");
  const body = await req.body;
  const orderId = req.params.orderId;
  const updateType = body.updateType as OrderAction;
  const otp = body.otp as string;
  const date = body.date as string;
  const userId = body.userId as string;
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

export const deleteOrder = async (req : Request, res : Response) =>{
  res.set("Access-Control-Allow-Origin", "*");
  const orderId = req.params.orderId;
  const userId = req.query.userId as string;
  const userName = req.query.userId as string;
  try {
    await moveOrderToCancelledOrders(orderId, userId);
    await moveOrderToCancelledOrdersGlobal(orderId);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Unable to cancel the order"});
  }
  try {
    const notificationBody = `
    A order has been Cancelled by ${userName}
    `;
    await sendNotificationToAdmin("Order Cancelled",
      notificationBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Unable to send notification"});
  }
  res.end();
};
