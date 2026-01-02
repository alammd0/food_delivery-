import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

// 1. Get Cart item
export const getCart = async (req : Request, res : Response) => {
    try{
        const carts = await prisma.cart.findMany({
            select : {
                id : true,
                userId : true,
                items : {
                    select : {
                        id : true,
                        foodId : true,
                        quantity : true,
                        price : true
                    }
                }
            }
        })

        if(carts.length > 0){
            return res.status(200).json({
                message : "Cart items fetched successfully",
                carts
            })
        }
        else{
            return res.status(404).json({
                message : "Cart items not found"
            })
        }
    }
    catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}

// 2. Add item in Cart 
export const addItemInCart = async (req: Request, res: Response) => {
    try{
        const { foodId, Quantity, price } = req.body;

        // @ts-ignore
        const UserId = req.user.id;

        const existingItemInCart = await prisma.cartItem.findFirst({
            where : {
                foodId
            }
        })

        if(existingItemInCart){
            const updatedCart = await prisma.cartItem.update({
                where : {
                    id : existingItemInCart.id
                }, 
                data : {
                    quantity : existingItemInCart.quantity + Quantity,
                    price : existingItemInCart.price + price
                }
            })
        }else{
            // 1. find Cart by UserID 
            const existCart = await prisma.cart.findFirst({
                where : {
                    userId : UserId
                }
            })

            let newCart;
            let newCartItem;

            if(!existCart){
                // 1. Create new cart : TODO -> add cartItem to cart
                newCart = await prisma.cart.create({
                    data : {
                        userId : UserId
                    }
                })

                 // Update User cart : TODO 
                await prisma.user.update({
                    where : {
                        id : UserId
                    }, 
                    data : {
                        cart : {
                            connect : {
                                id : Number(newCart?.id)
                            }
                        }
                    }
                })

                 // 3. add item to cart
                newCartItem = await prisma.cartItem.create({
                    data : {
                        cartId : Number(newCart?.id),
                        foodId,
                        quantity : Quantity,
                        price : price
                    }
                })
            }

            // Update User cart : TODO 
            await prisma.user.update({
                where : {
                    id : UserId
                }, 
                data : {
                    cart : {
                        connect : {
                            id : Number(existCart?.id)
                        }
                    }
                }
            })

            // 2. add item to cart
            newCartItem = await prisma.cartItem.create({
                data : {
                    cartId : Number(existCart?.id),
                    foodId,
                    quantity : Quantity,
                    price : price
                }
            });
            
            return res.status(200).json({
                message : "Item added to cart successfully",
                cart : newCart,
                cartItem : newCartItem
            })
        }
    }
    catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}

// 3. Update Quantity 
export const updateQuantity = async (req: Request, res: Response) => {
    try{
        const { id, Quantity } = req.body;

        const cartItem = await prisma.cartItem.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!cartItem){
            return res.status(404).json({
                message : "Cart item not found"
            })
        }

        // TODO : update cartItem quantity
        const updatedCartItem = await prisma.cartItem.update({
            where:{
                id : Number(id)
            },
            data : {
                quantity : Quantity,
                price : cartItem.price
            }
        })

        return res.status(200).json({
            message : "Cart item updated successfully",
            cartItem : updatedCartItem
        })
    }
    catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}

// 4. Remove item from cart 
export const removeItemFromCart = async (req: Request, res: Response) => {
    try{
        const { id } = req.body;
        
        // @ts-ignore
        const userId = req.user.id;

        const cartItem = await prisma.cartItem.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!cartItem){
            return res.status(404).json({
                message : "Cart item not found"
            })
        }

        await prisma.cartItem.delete({
            where : {
                id : Number(id)
            }
        })

        const countCartItems = await prisma.cartItem.count({
            where : {
                cartId : Number(cartItem.cartId)
            }
        })

        if(countCartItems === 0) {
            await prisma.cart.delete({
                where : {
                    id : Number(cartItem.cartId)
                }
            })

            // update user cart 
            await prisma.user.update({
                where : {
                    id : userId
                },
                data : {
                    cart : {
                        disconnect : {
                            id : Number(cartItem.cartId)
                        }
                    }
                }
            })
        }

         return res.status(200).json({
            message : "Item removed from cart successfully",
            cartItem
        })
    }
    catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}

// 5. Clear our Cart item 
export const clearCart = async (req: Request, res: Response) => {
    try{
        // @ts-ignore
        const userId = req.user.id;

        const cart = await prisma.cart.findFirst({
            where : {
                userId : userId
            }
        })

        if(!cart){
            return res.status(404).json({
                message : "Cart not found"
            })
        }


        await prisma.cart.delete({
            where : {
                id : Number(cart.id)
            }
        })

        // H/W:TODO 
        // 1. Kya item cartitem se remove karna
        // 2. Update user cart

        return res.status(200).json({
            message : "Cart cleared successfully",
            cart
        })

    }
    catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}