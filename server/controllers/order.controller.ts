import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { razorpay } from "../config/razorpay";
import items from "razorpay/dist/types/items";
import crypto from "crypto";

// 1. Create a checkout : TODO
export const createCheckOut = async (req: Request, res : Response) => {
    try {

        // @ts-ignore
        const userId = req.user.id 

        const { paymentMethod } = req.body


        // find Cart items related to user 
        const cart = await prisma.cart.findFirst({
            where : {
                userId : userId
            },
            include : {
                items : {
                    include: {
                        food : true
                    }
                }
            }
        })

        if(!cart || cart.items.length === 0){
            return res.status(404).json({
                message : "Cart is empty"
            })
        }

        // total prices
        const totalPrice = cart.items.reduce((sum, item) => (
            sum + Number(item.price) * item.quantity
        ), 0)

        // TODO : payment method
        if(!cart.items[0]?.food?.restaurantId){
            return res.status(404).json({
                message : "Restaurant not found"
            })
        }

        // order create 
        const order = await prisma.order.create({
            data: {
                userId : userId,
                totalAmount: totalPrice,
                restaurantId : cart.items[0]?.food?.restaurantId,
                paymentStatus : "PENDING",
                items: {
                    create: cart.items.map((item) => ({
                            foodId: item.foodId,
                            quantity: item.quantity,
                            price: item.price
                        })),
                    }
            }
        });


        // payment record create 
        const payment = await prisma.payment.create({
            data : {
                userId : userId,
                orderId : order.id,
                paymentMethod : paymentMethod,
                amount : totalPrice,
                currency : "INR",
                status: paymentMethod === "COD" ? "PAID" : "PENDING",
            }
        })

        // if Payment method is COD
        if (paymentMethod === "COD") {
            // update order status to ACCEPTED
            await prisma.order.update({
                where : {
                    id : order.id
                },
                data :{
                    status : "ACCEPTED",
                    paymentStatus : "PAID"
                }
            })

            // clear item from cart 
            await prisma.cartItem.deleteMany({
                where : {
                    cartId : cart.id
                }
            })

            return res.status(200).json({
                message : "Checkout created successfully",
                order : order,
                payment : payment
            })
        }

        return res.status(200).json({
            message : "Checkout Processed with Razorpay",
            order : order,
            totalPrice : totalPrice,
        })

    }
    catch (error) {
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}

// 2. Create an order 
export const createOrder = async (req: Request, res : Response) => {
    try{
        const { orderId } = req.body;

        const order = await prisma.order.findFirst({
            where : {
                id : orderId
            }
        })

        if(!order){
            return res.status(404).json({
                message : "Order not found"
            })
        }

        const razorpayOrder = await razorpay.orders.create({
            amount : Number(order.totalAmount),
            currency : "INR",
            receipt : String(order.id)
        })


        await prisma.order.update({
            where : {
                id : order.id
            },
            data : {
                paymentStatus : "PAID",
                payment : {
                    connect : {
                        id : Number(razorpayOrder.id)
                    }
                },
                gatewayOrderId : razorpayOrder.id
            }
        })

        return res.status(200).json({
            message : "Order created successfully",
            razorpayOrder : razorpayOrder,
            order : order
        })
    }
    catch(error){
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}

// 3. Verify the payment
export const VerifyPayment = async (req : Request, res : Response) => {
    try {
        const { paymentId, rz_order_id, rz_signature } = req.body;

        if(!paymentId || !rz_order_id || !rz_signature){
            return res.status(400).json({
                message : "Payment id, order id and signature are required"
            })
        }

        const payment = await prisma.payment.findFirst({
            where : {
                id : paymentId
            }
        })

        if(!payment){
            return res.status(404).json({
                message : "Payment not found"
            })
        }

        const body = rz_order_id + "|" + paymentId;

        const exceptedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string).update(body).digest('hex');

        if(exceptedSignature !== rz_signature){
            return res.status(401).json({
                message : "Signature not valid"
            })
        }

        // update payment status to PAID
        await prisma.payment.update({
            where : {
                id : paymentId
            },
            data : {
                gatewaySignature : rz_signature,
                gatewayPaymentId : paymentId,
                orderId : payment.orderId,
                status : "PAID",
                paymentGateway : "RAZORPAY"
            }
        })

        return res.status(200).json({
            message : "Payment verified successfully",
            payment : payment
        })
    }
    catch (error) {
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}

// 4. find all order history 
export const findOrderHistory = async (req : Request, res : Response) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy : {
                createdAt : "desc"
            }
        });


        if(orders.length === 0){
            return res.status(404).json({
                message : "Order history not found"
            })
        }

        return res.status(200).json({
            message : "Order history fetched successfully",
            orders : orders
        })
    }
    catch (error) {
        return res.status(500).json({
            message : "Internal server error"
        })
    } 
}

// 5. find payment history
export const findPaymentHistory = async (req : Request, res : Response) => {
    try {
        const payments = await prisma.payment.findMany({
            orderBy : {
                createdAt : "desc"
            }
        }); 

        if(payments.length === 0){
            return res.status(404).json({
                message : "Payment history not found"
            })
        }
        
        return res.status(200).json({
            message : "Payment history fetched successfully",
            payments : payments
        })
    }
    catch (error) {
        return res.status(500).json({
            message : "Internal server error"
        })
    } 
}

// // 6. Cancel order
// export const cancelOrder = async (req : Request, res : Response) => {
//     try {

//     }
//     catch (error) {
//         return res.status(500).json({
//             message : "Internal server error"
//         })
//     } 
// }

// // 7. Refund order
// export const refundOrder = async (req : Request, res : Response) => {
//     try {

//     }
//     catch (error) {
//         return res.status(500).json({
//             message : "Internal server error"
//         })
//     } 
// }