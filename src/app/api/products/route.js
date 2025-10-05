import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '../../models/Product';
import Category from '../../models/Category';
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
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
    const { name, category, imageUrl, shortDescription, mrp, discount, price } = body;

    // Validation
    if (!name || !category || !imageUrl || !shortDescription || !mrp || !price) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(parseFloat(mrp)) || parseFloat(mrp) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid MRP is required' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(discount)) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
      return NextResponse.json(
        { success: false, error: 'Discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid price is required' },
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

    // Validate image URL format
    try {
      new URL(imageUrl);
    } catch (urlError) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid image URL' },
        { status: 400 }
      );
    }

    // Validate description length
    if (shortDescription.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Short description must be less than 200 characters' },
        { status: 400 }
      );
    }

    // Create product with all fields
    const product = await Product.create({
      name: name.trim(),
      category,
      imageUrl: imageUrl.trim(),
      shortDescription: shortDescription.trim(),
      mrp: parseFloat(mrp),
      discount: parseFloat(discount),
      price: parseFloat(price)
    });

    await product.populate('category', 'name description');

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}