'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductCard({ product, onProductClick }) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-700 overflow-hidden">
        {!imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {product.shortDescription}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-400">
            ${product.price}
          </span>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart functionality will be implemented later
              console.log('Add to cart:', product.name);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}