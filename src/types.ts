/* eslint-disable linebreak-style */
export type Product = {
  productId: string;
  size: string;
  imageUrl: string;
  name: string;
  gst: number;
  isFeatured: boolean;
  discountedPrice: number;
  price: number;
  description: string;
  inStock: number;
  nos?: number;
};

export type OrderDetails = {
  address: string;
  pincode: string;
  isAccepted: boolean;
  isDelivered: boolean;
  amount: string;
  mobileNumber: string;
  userName: string;
  payment: boolean;
  orderId: string;
  gst: string;
  time: string;
  userId: string;
  orderTime: Date;
  products?: Product[];
  orderAcceptTime?: Date;
  deliverTime?: Date;
};
