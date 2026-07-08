import { NextResponse } from "next/server";

export async function POST() {
  // Production: create pending order, sign VNPay params, return paymentUrl.
  return NextResponse.json({
    paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    message: "VNPay integration placeholder"
  });
}
