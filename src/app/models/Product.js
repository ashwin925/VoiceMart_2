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
    validate: {
      validator: function(v) {
        if (!v || typeof v !== 'string') return false;
        const s = v.trim();
        // allow data URIs and blob URLs
        if (s.startsWith('data:') || s.startsWith('blob:')) return true;
        // allow relative/local paths
        if (s.startsWith('/') || s.startsWith('./') || s.startsWith('../')) return true;
        // allow bare filenames like 'globe.svg'
        if (/^[^\s\/]+\.[a-z0-9]{2,6}$/i.test(s)) return true;
        // allow http/https
        try {
          const u = new URL(s);
          return ['http:', 'https:'].includes(u.protocol);
        } catch (e) {
          return false;
        }
      },
      message: 'Please enter a valid image URL or upload a file'
    }
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxLength: [200, 'Short description cannot exceed 200 characters']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative'],
    max: [100000, 'MRP cannot exceed 100000']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed 100000']
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
  
  // Auto-calculate price if not provided
  if (this.mrp && this.discount !== undefined && !this.price) {
    this.price = this.mrp - (this.mrp * this.discount / 100);
  }
  
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', shortDescription: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);