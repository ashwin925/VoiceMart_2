'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ProductCard({ product, onProductClick, isFocused = false }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      cardRef.current.focus();
    }
  }, [isFocused]);

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`
        bg-gray-800 rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer group
        ${isFocused 
          ? 'border-blue-500 shadow-2xl shadow-blue-500/50 scale-105 voice-focus' 
          : 'border-gray-700 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10'
        }
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      data-product-name={product.name.toLowerCase()}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-700 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <Image
          src={imageError ? 'https://via.placeholder.com/400x300/374151/FFFFFF?text=Image+Not+Found' : product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
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