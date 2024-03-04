/* eslint-disable linebreak-style */
export enum OrderAction {
  ACCEPT_ORDER = "Accept Order",
  CONFIRM_ORDER = "Confirm Order",
  DELETE_ORDER = "Cancel Order",
}
export const generateOTP = (length: number) => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
