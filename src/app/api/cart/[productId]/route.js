import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Cart from '../../../models/Cart';

// REMOVE item from cart
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove the item
    cart.items = cart.items.filter(
      item => item.product.toString() !== params.productId
    );

    await cart.save();
    await cart.populate('items.product', 'name imageUrl price shortDescription');

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}