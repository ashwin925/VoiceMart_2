'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { categoriesAPI, productsAPI } from '@/lib/api';

export default function ProductForm({ 
  product = null, 
  onSuccess, 
  onCancel,
  categoryId = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: categoryId || '',
    imageUrl: '',
    shortDescription: '',
    mrp: '',
    discount: '0',
    price: '',
    imageFile: null
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        imageUrl: product.imageUrl || '',
        shortDescription: product.shortDescription || '',
        mrp: product.mrp || product.price || '',
        discount: product.discount || '0',
        price: product.price || '',
        imageFile: null
      });
      setImagePreview(product.imageUrl || '');
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imageFile' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setImagePreviewError(false);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'imageUrl') setImagePreviewError(false);
      
      // Auto-calculate price if MRP and discount are provided
      if ((name === 'mrp' || name === 'discount') && formData.mrp && formData.discount) {
        const mrp = name === 'mrp' ? parseFloat(value) : parseFloat(formData.mrp);
        const discount = name === 'discount' ? parseFloat(value) : parseFloat(formData.discount);
        
        if (!isNaN(mrp) && !isNaN(discount) && discount >= 0 && discount <= 100) {
          const calculatedPrice = mrp - (mrp * discount / 100);
          setFormData(prev => ({ 
            ...prev, 
            price: calculatedPrice.toFixed(2)
          }));
        }
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // For new products, require an uploaded image file. For edits, leaving
    // the file empty will keep the existing image (pre-filled in imagePreview).
    if (!product && !formData.imageFile) {
      newErrors.imageFile = 'Please select an image file';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Description must be less than 200 characters';
    }

    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      newErrors.mrp = 'Valid MRP is required';
    }

    if (!formData.discount || parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // (Removed URL validation helper — uploads only.)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // If a file was selected but the preview hasn't finished loading yet,
      // convert the file to a data URL before sending.
      const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        } catch (err) {
          reject(err);
        }
      });

      // Always convert the selected file to a data URL to avoid timing/race issues
      let finalImagePreview = imagePreview;
      if (formData.imageFile) {
        try {
          finalImagePreview = await readFileAsDataURL(formData.imageFile);
          // update preview state so UI shows it after submit if needed
          setImagePreview(finalImagePreview);
        } catch (readErr) {
          console.error('Failed to read image file before submit:', readErr);
        }
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        shortDescription: formData.shortDescription,
        mrp: parseFloat(formData.mrp),
        discount: parseFloat(formData.discount),
        price: parseFloat(formData.price),
        // Use the uploaded preview if present; for edits this will be the
        // existing image (imagePreview was initialized from product.imageUrl).
        imageUrl: finalImagePreview || formData.imageUrl
      };

      // Debug: ensure imageUrl is set and looks like a data URI when uploading
      try {
        console.debug('Product submit imageUrl type:', typeof productData.imageUrl);
        if (productData.imageUrl && typeof productData.imageUrl === 'string') {
          console.debug('imageUrl length:', productData.imageUrl.length);
          console.debug('imageUrl startsWith data:', productData.imageUrl.startsWith('data:'));
        }
      } catch (dbgErr) {
        // ignore debug errors
      }

      if (!productData.imageUrl || (typeof productData.imageUrl === 'string' && productData.imageUrl.trim() === '')) {
        setErrors({ submit: 'No image data available. Please select an image file and wait for preview to appear.' });
        setLoading(false);
        return;
      }

      // Trim and ensure string type
      if (typeof productData.imageUrl === 'string') productData.imageUrl = productData.imageUrl.trim();

      if (product) {
        await productsAPI.update(product._id, productData);
      } else {
        await productsAPI.create(productData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 card-padding rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="margin-top-sm text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full button-padding bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-600'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="margin-top-sm text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Image Upload (upload-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
            Product Image {product ? <span className="text-sm text-gray-400">(leave empty to keep existing)</span> : '*'}
          </label>
          <div>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleChange}
              className={`w-full button-padding bg-gray-700 border rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${
                errors.imageFile ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.imageFile && (
              <p className="margin-top-sm text-sm text-red-500">{errors.imageFile}</p>
            )}
            {product && !imagePreview && (
              <p className="text-sm text-gray-400 margin-top-sm">No image selected — the existing image will be kept.</p>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {(imagePreview || formData.imageUrl) && (
          <div>
            <p className="text-sm text-gray-400 margin-bottom-sm">Image Preview:</p>
            <div className="relative h-48 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <img
                src={imagePreview || formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImagePreviewError(true)}
                onLoad={() => setImagePreviewError(false)}
              />
              {imagePreviewError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-600">
                  <span className="text-gray-400">Failed to load image</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
            Short Description *
          </label>
          <textarea
            name="shortDescription"
            rows={3}
            value={formData.shortDescription}
            onChange={handleChange}
            className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.shortDescription ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter a brief description of the product"
          />
          <div className="flex justify-between margin-top-sm">
            {errors.shortDescription ? (
              <p className="text-sm text-red-500">{errors.shortDescription}</p>
            ) : (
              <p className="text-sm text-gray-400">
                {formData.shortDescription.length}/200 characters
              </p>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MRP */}
          <div>
            <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
              MRP (INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">₹</span>
              </div>
              <input
                type="number"
                name="mrp"
                min="0"
                step="0.01"
                value={formData.mrp}
                onChange={handleChange}
                className={`block w-full pl-8 pr-3 button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.mrp ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.mrp && (
              <p className="margin-top-sm text-sm text-red-500">{errors.mrp}</p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
              Discount (%) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">%</span>
              </div>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                className={`block w-full pl-8 pr-3 button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.discount ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0"
              />
            </div>
            {errors.discount && (
              <p className="margin-top-sm text-sm text-red-500">{errors.discount}</p>
            )}
          </div>

          {/* Final Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
              Final Price (INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">₹</span>
              </div>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`block w-full pl-8 pr-3 button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0.00"
                readOnly
              />
            </div>
            {errors.price && (
              <p className="margin-top-sm text-sm text-red-500">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Price Calculation Info */}
        {formData.mrp && formData.discount && formData.price && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg card-padding">
            <div className="text-sm text-blue-300">
              <div className="flex justify-between margin-bottom-sm">
                <span>MRP:</span>
                <span className="line-through">₹{parseFloat(formData.mrp).toFixed(2)}</span>
              </div>
              <div className="flex justify-between margin-bottom-sm">
                <span>Discount ({formData.discount}%):</span>
                <span className="text-green-400">-₹{(parseFloat(formData.mrp) * parseFloat(formData.discount) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span>Final Price:</span>
                <span>₹{parseFloat(formData.price).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 margin-top-lg pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-medium"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="spinner"></div>
              <span>Saving...</span>
            </div>
          ) : product ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </button>
      </div>
    </form>
  );
}