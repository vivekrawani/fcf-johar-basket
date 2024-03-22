import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import {
  streamData,
} from "./database";
import {
  deleteOrder,
  getNewOrders,
  getPastOrders,
  updateOrder,
} from "./routes";
import {sendNotification} from "./notifications";
import {authorization, authenticateToken} from "./auth";

setGlobalOptions({maxInstances: 10});
const appExpress = express();
appExpress.use(cors({origin: "*"}));
appExpress.options("*", cors());

appExpress.get("/auth", authorization);
appExpress.get("/orders/newOrders", authenticateToken, getNewOrders);
appExpress.get("/orders/pastOrders", authenticateToken, getPastOrders);
appExpress.get("/orders/v2/newOrders", streamData);
appExpress.post("/v1/notification", cors({
  "origin": "*",
  "methods": "POST",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
}), authenticateToken, sendNotification);
appExpress.patch("/orders/:orderId", cors({
  "origin": "*",
  "methods": "PATCH",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
}), authenticateToken, updateOrder);
appExpress.delete("/orders/:orderId", cors({
  "origin": "*",
  "methods": "DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
}), deleteOrder);

export const api = onRequest(
  {cors: true, region: ["asia-east1"]},
  appExpress
);

