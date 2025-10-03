import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid image URL']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxLength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed 10000']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', shortDescription: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);