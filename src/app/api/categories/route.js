import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Category from '../../models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all categories with product counts
export async function GET() {
  try {
    await dbConnect();
    
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.isActive', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE new category (Admin only)
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      description
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}