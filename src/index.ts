import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import {updateOrder, getNewOrders, getPastOrders, streamData} from "./database";
import {sendNotification} from "./notifications";
import {authorization} from "./auth";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// Set the maximum instances to 10 for all functions
setGlobalOptions({maxInstances: 10});
const appExpress = express();
appExpress.use(cors({origin: "*"}));
appExpress.options("*", cors());
appExpress.get("/auth", authorization);
appExpress.get("/orders/newOrders", getNewOrders);
appExpress.get("/orders/pastOrders", getPastOrders);
appExpress.get("/orders/v2/newOrders", streamData);
appExpress.post("/v1/notification", cors({
  "origin": "*",
  "methods": "POST",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
}), sendNotification);
appExpress.patch("/orders/:orderId", cors({
  "origin": "*",
  "methods": "PATCH",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
}), updateOrder);

export const api = onRequest(
  {cors: true, region: ["asia-east1"]},
  appExpress
);

