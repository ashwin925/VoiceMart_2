'use client';
import { useState, useEffect } from 'react';

export default function ProductForm({ 
  product = null, 
  categories = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    imageUrl: '',
    shortDescription: '',
    price: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        imageUrl: product.imageUrl || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid image URL';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Description must be less than 200 characters';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-700'
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
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">
            Image URL *
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.imageUrl ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
          )}
          {formData.imageUrl && !errors.imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
              <div className="relative h-32 bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-300">
            Short Description *
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={3}
            value={formData.shortDescription}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.shortDescription ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter a brief description of the product"
          />
          <div className="mt-1 flex justify-between">
            {errors.shortDescription ? (
              <p className="text-sm text-red-500">{errors.shortDescription}</p>
            ) : (
              <p className="text-sm text-gray-400">
                {formData.shortDescription.length}/200 characters
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">
            Price *
          </label>
          <div className="mt-1 relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`block w-full pl-7 pr-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}