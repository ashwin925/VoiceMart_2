import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all products with categories
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    
    let query = { isActive: true };
    if (categoryId) {
      query.category = categoryId;
    }

    const products = await Product.find(query)
      .populate('category', 'name description')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE new product (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { name, category, imageUrl, shortDescription, price } = body;

    // Validation
    if (!name || !category || !imageUrl || !shortDescription || !price) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const product = await Product.create({
      name,
      category,
      imageUrl,
      shortDescription,
      price: parseFloat(price)
    });

    await product.populate('category', 'name description');

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}