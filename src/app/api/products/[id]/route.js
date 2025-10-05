import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET single product
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const product = await Product.findById(params.id)
      .populate('category', 'name description');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// UPDATE product (Admin only)
export async function PUT(request, { params }) {
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
    // Allow data URIs, absolute http(s) URLs, same-origin paths, and bare filenames
    let finalImageUrl = imageUrl;
    const isString = typeof imageUrl === 'string';
    const isDataUri = isString && imageUrl.startsWith('data:');
    const isRelativeOrLocal = isString && (imageUrl.startsWith('/') || imageUrl.startsWith('./') || imageUrl.startsWith('../'));

    if (!isDataUri && !isRelativeOrLocal) {
      try {
        const parsed = new URL(imageUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return NextResponse.json({ success: false, error: 'Please enter a valid image URL' }, { status: 400 });
        }
      } catch (urlError) {
        // If parsing fails, accept bare filenames like 'globe.svg' by treating them as relative
        if (isString && /^[^\s\/]+\.[a-z0-9]{2,6}$/i.test(imageUrl)) {
          finalImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        } else {
          return NextResponse.json({ success: false, error: 'Please enter a valid image URL' }, { status: 400 });
        }
      }
    }

    // Validate description length
    if (shortDescription.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Short description must be less than 200 characters' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        category,
        imageUrl: (finalImageUrl || '').trim(),
        shortDescription: shortDescription.trim(),
        mrp: parseFloat(mrp),
        discount: parseFloat(discount),
        price: parseFloat(price)
      },
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
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
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}