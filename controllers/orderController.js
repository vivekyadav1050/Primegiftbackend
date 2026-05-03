import Brand from "../models/Brand.js";
import Order from "../models/Order.js";
import Voucher from "../models/Voucher.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import { getValidToken } from "../services/hubbleService.js";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../services/hubbleService.js";

const toPaise = (r) => Math.round(Number(r) * 100);

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { brandId, amount, paymentMethod, payingAmount } = req.body;

    const brand = await Brand.findOne({ brandId });

    const voucherPaise = toPaise(amount);

    let discountPercent = brand.discountPercent || 0;

    const discountPaise = Math.floor((voucherPaise * discountPercent) / 100);
    const payablePaise = voucherPaise - discountPaise;

    const order = await Order.create({
      userId,
      items: [{
        brandId,
        brandName: brand.name,
        amount: voucherPaise,
        quantity: 1
      }],
      totalAmount: payablePaise,
      status: "CREATED",
      payment: {
        method: paymentMethod,
        paymentStatus: "PENDING",
        discountAmount: discountPaise,
        discountPercent,
        finalAmount: payablePaise,
        originalAmount: voucherPaise
      }
    });

    const razorpay = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: payablePaise,
      currency: "INR",
      receipt: `order_${order._id}`
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpay_order_id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "SUCCESS" || order.status === "PROCESSING") {
      return res.json({
        success: true,
        status: order.status,
        orderId: order._id,
        message: "Already processing"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.amount !== order.totalAmount) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    order.status = "PROCESSING";
    order.payment.paymentStatus = "SUCCESS";
    order.payment.transactionId = razorpay_payment_id;
    await order.save();

    const payload = {
      productId: order.items[0].brandId,
      referenceId: order._id.toString(),
      amount: order.items[0].amount / 100,
      denominationDetails: [
        { denomination: order.items[0].amount / 100, quantity: 1 }
      ],
      customerDetails: {
        name: "User",
        phoneNumber: "9999999999",
        email: "test@gmail.com"
      },
      deliveryDetails: {
        recipientName: "User",
        recipientType: "SELF",
        recipientPhoneNumber: "9999999999",
        senderName: "PrimeGift",
        wishMessage: "Enjoy your gift 🎁"
      }
    };

    const token = await getValidToken();

  const hubbleRes = await axios.post(
    `${BASE_URL}/v1/partners/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-id": uuidv4()
      }
    }
);

    const hubbleStatus = hubbleRes.data?.status;

    order.provider = {
      name: "HUBBLE",
      referenceId: payload.referenceId,
      response: hubbleRes.data
    };

    // SUCCESS
    if (hubbleStatus === "SUCCESS" && hubbleRes.data?.vouchers?.length > 0) {
      const vouchers = hubbleRes.data.vouchers || [];

      for (const v of vouchers) {
        const exists = await Voucher.findOne({
          code: v.cardNumber,
          orderId: order._id
        });
        if (exists) continue;

        await Voucher.create({
          orderId: order._id,
          userId: order.userId,
          brandId: order.items[0].brandId,
          code: v.cardNumber || null,
          pinEncrypted: v.cardPin || null,
          amount: Math.round(v.amount * 100)
        });
      }

      order.status = "SUCCESS";
      order.deliveryStatus = "DELIVERED";
      await order.save();

      return res.json({
        success: true,
        status: "SUCCESS",
        orderId: order._id
      });
    }

    // PROCESSING
    if (hubbleStatus === "PROCESSING") {
      order.status = "PROCESSING";
      order.deliveryStatus = "PENDING";
      await order.save();

      pollHubbleOrder(order._id, hubbleRes.data.id);

      return res.json({
        success: true,
        status: "PROCESSING",
        orderId: order._id
      });
    }

    // FAILED
    if (hubbleStatus === "FAILED" || hubbleStatus === "CANCELLED") {
      if (order.payment.transactionId) {
        await razorpay.payments.refund(order.payment.transactionId, {
          amount: order.totalAmount
        });
      }

      order.status = "FAILED";
      order.failureReason = hubbleRes.data?.failureReason || "Voucher failed";
      await order.save();

      return res.json({
        success: false,
        status: hubbleStatus,
        message: "Refund initiated"
      });
    }

    // REVERSED
    if (hubbleStatus === "REVERSED") {
      order.status = "FAILED";
      order.failureReason = "Reversed by provider";
      await order.save();

      return res.json({
        success: false,
        status: "REVERSED"
      });
    }

    await order.save();
    return res.json({ success: false, status: hubbleStatus || "UNKNOWN" });

  } catch (err) {
    await Order.updateOne(
      { "payment.razorpayOrderId": req.body.razorpay_order_id },
      { status: "FAILED" }
    );

    return res.status(500).json({
      success: false,
      message: "Voucher generation failed"
    });
  }
};

export async function pollHubbleOrder(orderId, hubbleOrderId) {
  try {
    const token = await getValidToken();

    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 60000));

      const res = await axios.get(
        `${BASE_URL}/v1/partners/orders/${hubbleOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = res.data;

      const order = await Order.findById(orderId);
      if (!order) return;

      if (data.status === "SUCCESS") {
        for (const v of (data.vouchers || [])) {
          const exists = await Voucher.findOne({
            code: v.cardNumber,
            orderId: order._id
          });
          if (exists) continue;

          await Voucher.create({
            orderId: order._id,
            userId: order.userId,
            brandId: order.items[0].brandId,
            code: v.cardNumber || null,
            pinEncrypted: v.cardPin || null,
            amount: Math.round(v.amount * 100)
          });
        }

        order.status = "SUCCESS";
        order.deliveryStatus = "DELIVERED";
        await order.save();
        return;
      }

      if (data.status === "FAILED") {
        const razorpay = new Razorpay({
          key_id: process.env.KEY_ID,
          key_secret: process.env.KEY_SECRET,
        });

        if (order.payment.transactionId) {
          await razorpay.payments.refund(order.payment.transactionId, {
            amount: order.totalAmount
          });
        }

        order.status = "FAILED";
        order.failureReason = data.failureReason || "Failed after polling";
        await order.save();
        return;
      }
    }

    await Order.findByIdAndUpdate(orderId, {
      status: "FAILED",
      failureReason: "Timeout after polling"
    });

  } catch (err) {
    console.error("Polling error:", err.message);
  }
}

export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⏳ not completed
    if (order.status !== "SUCCESS") {
      return res.json({
        status: order.status,
        deliveryStatus: order.deliveryStatus
      });
    }

    // ✅ fetch vouchers
    const vouchers = await Voucher.find({ orderId: order._id }).lean();

    if (vouchers.length === 0) {
      return res.json({ status: "PROCESSING" });
    }

    const brandId = vouchers[0].brandId;

    const brand = await Brand.findOne({ brandId }).lean();

    const enrichedVouchers = vouchers.map(v => ({
      ...v,
      brandName: brand?.name || "Unknown",
      brandImage: brand?.image || brand?.logo || ""
    }));

    return res.json({
      status: "SUCCESS",
      vouchers: enrichedVouchers
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      userId,
      status: { $in: ["SUCCESS", "PROCESSING"] }
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map(o => o._id);

    const vouchers = await Voucher.find({
      orderId: { $in: orderIds }
    }).lean();

    const voucherMap = {};
    vouchers.forEach(v => {
      if (!voucherMap[v.orderId]) voucherMap[v.orderId] = [];
      voucherMap[v.orderId].push(v);
    });

    const brandIds = [...new Set(
      orders.map(o => o.items[0]?.brandId)
    )];

    const brands = await Brand.find({
      brandId: { $in: brandIds }
    }).lean();

    const brandMap = {};
    brands.forEach(b => {
      brandMap[b.brandId] = b;
    });

    const finalOrders = orders.map(o => ({
      _id: o._id,
      status: o.status,
      deliveryStatus: o.deliveryStatus,
      createdAt: o.createdAt,
      amount: o.totalAmount,

      brandName: brandMap[o.items[0]?.brandId]?.name || "Unknown",
      brandImage:
        brandMap[o.items[0]?.brandId]?.image ||
        brandMap[o.items[0]?.brandId]?.logo ||
        "",

      vouchers: (voucherMap[o._id] || []).map(v => ({
        code: v.code,
        pin: v.pinEncrypted,
        amount: v.amount
      }))
    }));

    res.json({ orders: finalOrders });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};