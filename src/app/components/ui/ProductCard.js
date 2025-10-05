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
    alert(`🚀 Purchasing ${product.name}!`);
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
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        )}
        
        {/* Optimized Image using next/image */}
        <div className="relative w-full h-full">
          {
            // Use next/image for local or same-origin images to get optimization.
            // For external hosts (not configured in next.config.js) fall back to a plain <img>.
          }
          {(() => {
            const src = imageError ? 'https://via.placeholder.com/400x300?text=No+Image' : (product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image');

            let isExternal = false;
            try {
              const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
              // Treat as external when hostname differs from current origin and protocol is http(s)
              if ((url.protocol === 'http:' || url.protocol === 'https:') && typeof window !== 'undefined') {
                isExternal = url.hostname !== window.location.hostname;
              }
            } catch (e) {
              // If URL parsing fails, treat as local
              isExternal = false;
            }

            if (!isExternal) {
              return (
                <Image
                  src={src}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'} ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              );
            }

            // Fallback for external images (avoids next/image host config errors)
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={product.name}
                className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'} ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            );
          })()}
        </div>
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse z-20">
            {product.discount}% OFF
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`} />
      </div>

      {/* Product Info */}
      <div className="card-padding relative z-20">
        <h3 className="font-bold text-white margin-bottom-sm line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300 neon-text">
          {product.name}
        </h3>
        
        <p className="text-gray-300 text-sm margin-bottom line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Pricing Section */}
        <div className="space-y-3 margin-bottom">
          {/* MRP, Discount, Price Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* MRP */}
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
              <div className="text-xs text-gray-400 margin-bottom-sm">MRP</div>
              <div className="text-red-400 line-through text-sm font-semibold">
                ₹{product.mrp || product.price}
              </div>
            </div>

            {/* Discount */}
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
              <div className="text-xs text-gray-400 margin-bottom-sm">Discount</div>
              <div className="text-green-400 text-sm font-semibold">
                {product.discount || 0}%
              </div>
            </div>

            {/* Final Price */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg p-2 border border-cyan-500/30">
              <div className="text-xs text-cyan-300 margin-bottom-sm">Price</div>
              <div className="text-white font-bold text-sm">
                ₹{product.price}
              </div>
            </div>
          </div>

          {/* Savings */}
          {savings > 0 && (
            <div className="text-center">
              <span className="text-green-400 text-xs font-semibold bg-green-500/10 px-3 py-1 rounded-full animate-pulse">
                💰 Save ₹{savings.toFixed(2)}!
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button 
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white button-padding rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-gray-600 hover:border-cyan-400"
            onClick={handleAddToCart}
          >
            🛒 Add to Cart
          </button>
          <button 
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white button-padding rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
            onClick={handleBuyNow}
          >
            ⚡ Buy Now
          </button>
        </div>
      </div>

      {/* Cyberpunk Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
    </div>
  );
}