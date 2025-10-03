'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '../../../../store/cartStore';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400/374151/FFFFFF?text=Product+Image+Not+Found';

export default function ProductModal({ product, onClose }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();

  // Listen for voice commands
  useEffect(() => {
    const handleVoiceAddToCart = () => {
      console.log('🎤 Voice command: Add to cart for', product.name);
      handleAddToCart();
    };

    const handleVoiceBuyNow = () => {
      console.log('🎤 Voice command: Buy now for', product.name);
      handleBuyNow();
    };

    const handleVoiceExit = () => {
      console.log('🎤 Voice command: Exit modal');
      onClose();
    };

    window.addEventListener('voiceAddToCart', handleVoiceAddToCart);
    window.addEventListener('voiceBuyNow', handleVoiceBuyNow);
    window.addEventListener('voiceExit', handleVoiceExit);

    return () => {
      window.removeEventListener('voiceAddToCart', handleVoiceAddToCart);
      window.removeEventListener('voiceBuyNow', handleVoiceBuyNow);
      window.removeEventListener('voiceExit', handleVoiceExit);
    };
  }, [product, onClose]);

  const handleAddToCart = () => {
    console.log('🛒 Adding to cart:', product.name, 'Quantity:', quantity);
    addItem(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    console.log('💰 Buying now:', product.name, 'Quantity:', quantity);
    addItem(product, quantity);
    alert(`Purchasing ${quantity} x ${product.name}!`);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const imageUrl = imageError ? FALLBACK_IMAGE : product.imageUrl;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center container-padding z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="modal-padding">
          {/* Header */}
          <div className="flex justify-between items-start margin-bottom-sm">
            <h2 className="text-2xl font-bold text-white">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative h-64 md:h-80 bg-gray-700 rounded-lg overflow-hidden">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={`object-cover ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white margin-bottom-sm">Description</h3>
                <p className="text-gray-300">{product.shortDescription}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white margin-bottom-sm">Price</h3>
                <p className="text-3xl font-bold text-blue-400">${product.price}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white margin-bottom-sm">Quantity</h3>
                <div className="flex items-center space-x">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 margin-top">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white button-padding rounded-lg font-semibold transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white button-padding rounded-lg font-semibold transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}