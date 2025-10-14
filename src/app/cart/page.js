'use client';
import { useCartStore } from '../../../store/cartStore';
import Link from 'next/link';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice 
  } = useCartStore();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout!');
    // Checkout logic will be implemented later
  };

  useEffect(() => {
    const handleVoiceCommands = (event) => {
      if (event.type === 'voiceContinueShopping') {
        router.push('/');
      } else if (event.type === 'voiceProceedToCheckout') {
        handleCheckout();
      }
    };

    window.addEventListener('voiceContinueShopping', handleVoiceCommands);
    window.addEventListener('voiceProceedToCheckout', handleVoiceCommands);

    return () => {
      window.removeEventListener('voiceContinueShopping', handleVoiceCommands);
      window.removeEventListener('voiceProceedToCheckout', handleVoiceCommands);
    };
  }, [router]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 13m-7.5 5.5V21a1 1 0 001 1h4a1 1 0 001-1v-2.5" />
            </svg>
            <h2 className="mt-6 text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="mt-2 text-gray-400">Start shopping to add items to your cart.</p>
            <Link
              href="/"
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Cart Items */}
            <div className="divide-y divide-gray-700">
              {items.map((item) => (
                <div key={item.product._id} className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative h-20 w-20 bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {item.product.shortDescription}
                      </p>
                      <p className="text-blue-400 font-semibold mt-2">
                        ${item.product.price}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-750 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">
                    ${getTotalPrice().toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link
                    href="/"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handleCheckout}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}