import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

// GET user cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    let cart = await Cart.findOne({ user: session.user.id })
      .populate('items.product', 'name imageUrl price shortDescription');

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: []
      });
    }

    return NextResponse.json({
      success: true,
      data: cart
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ADD item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name imageUrl price shortDescription');

    return NextResponse.json({
      success: true,
      data: cart
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE item quantity
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name imageUrl price shortDescription');

    return NextResponse.json({
      success: true,
      data: cart
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CLEAR cart
export async function DELETE() {
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

    cart.items = [];
    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}