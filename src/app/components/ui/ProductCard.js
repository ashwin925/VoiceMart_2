'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCartStore } from '../../../../store/cartStore';

export default function ProductCard({ product, onProductClick, isFocused = false }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const { addItem } = useCartStore();

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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    alert(`Purchasing ${product.name}!`);
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

  const calculateSavings = () => {
    if (product.mrp && product.price) {
      return product.mrp - product.price;
    }
    return 0;
  };

  const savings = calculateSavings();

  return (
    <div 
      ref={cardRef}
      className={`
        product-card rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer group
        ${isFocused 
          ? 'voice-focus scale-105' 
          : 'border-gray-700 hover:border-blue-500'
        }
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      data-product-name={product.name.toLowerCase()}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-700 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <Image
          src={imageError ? 'https://via.placeholder.com/400x300/374151/FFFFFF?text=Image+Not+Found' : product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="card-padding">
        <h3 className="font-bold text-white margin-bottom-sm line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="text-gray-400 text-sm margin-bottom line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Pricing Section */}
        <div className="space-y-2 margin-bottom">
          {/* MRP, Discount, Price Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* MRP */}
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-xs text-gray-400 margin-bottom-sm">MRP</div>
              <div className="text-red-400 line-through text-sm font-semibold">
                ₹{product.mrp || product.price}
              </div>
            </div>

            {/* Discount */}
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-xs text-gray-400 margin-bottom-sm">Discount</div>
              <div className="text-green-400 text-sm font-semibold">
                {product.discount || 0}%
              </div>
            </div>

            {/* Final Price */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-2 border border-blue-500/30">
              <div className="text-xs text-blue-300 margin-bottom-sm">Price</div>
              <div className="text-white font-bold">
                ₹{product.price}
              </div>
            </div>
          </div>

          {/* Savings */}
          {savings > 0 && (
            <div className="text-center">
              <span className="text-green-400 text-sm font-semibold bg-green-500/10 px-2 py-1 rounded-full">
                You save ₹{savings.toFixed(2)}!
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button 
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white button-padding rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button 
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white button-padding rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl`} />
    </div>
  );
}