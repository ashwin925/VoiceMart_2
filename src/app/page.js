'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import InfiniteScrollCards from './components/ui/InfiniteScrollCards';
import ProductModal from './components/ui/ProductModal';
import VoiceAssistant from './components/ui/VoiceAssistant';
import { categoriesAPI, productsAPI } from '@/lib/api';
import { useCartStore } from '../../store/cartStore';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focusedProduct, setFocusedProduct] = useState(null);
  
  const productRefs = useRef(new Map());
  const addToCart = useCartStore(state => state.addItem);

  // Speak feedback wrapper used by voice handlers in this file
  const speakVoiceFeedback = useCallback((text) => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.volume = 0.9;
        speechSynthesis.speak(u);
      } catch (e) {
        console.warn('TTS failed:', e);
      }
    }
  }, []);

  

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch only active categories and products
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll()
      ]);

      const categoriesData = categoriesResponse.data || [];
      const productsData = productsResponse.data || [];

      setCategories(categoriesData);

      // Group ACTIVE products by category (only show products you've created)
      const productsByCategory = {};
      categoriesData.forEach(category => {
        const categoryProducts = productsData.filter(product => 
          (product.category?._id === category._id || product.category === category._id) && 
          product.isActive !== false
        );
        
        if (categoryProducts.length > 0) {
          productsByCategory[category._id] = categoryProducts;
        }
      });
      
      setProducts(productsByCategory);
    } catch (error) {
      console.error('Error fetching data:', error);
      // No fallback to mock data - only show what's in database
    } finally {
      setLoading(false);
    }
  };

  // Voice command event listeners
  const setupVoiceEventListeners = () => {
    window.addEventListener('voiceSelectProduct', handleVoiceSelectProduct);
    window.addEventListener('voiceAddToCart', handleVoiceAddToCart);
    window.addEventListener('voiceBuyNow', handleVoiceBuyNow);
    window.addEventListener('voiceExit', handleVoiceExit);
  };

  const cleanupVoiceEventListeners = () => {
    window.removeEventListener('voiceSelectProduct', handleVoiceSelectProduct);
    window.removeEventListener('voiceAddToCart', handleVoiceAddToCart);
    window.removeEventListener('voiceBuyNow', handleVoiceBuyNow);
    window.removeEventListener('voiceExit', handleVoiceExit);
  };

  const handleVoiceSelectProduct = useCallback((event) => {
    const rawName = (event?.detail?.productName || '').toLowerCase().trim();
    if (!rawName) return;
    console.log('🎯 Voice selecting product:', rawName);

    // Normalize tokens for fuzzy-ish matching
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const query = normalize(rawName);
    const tokens = query.split(' ').filter(Boolean);

    // Helper to score a product name; higher is better
    const scoreProduct = (p) => {
      const name = normalize(p.name);
      // exact include is best
      if (name === query) return 100;
      if (name.includes(query)) return 90;
      // token match count
      let matchCount = 0;
      for (const t of tokens) if (name.includes(t)) matchCount++;
      return Math.floor((matchCount / Math.max(tokens.length, 1)) * 80);
    };

    // Search across all products
    let best = null;
    let bestScore = 0;
    Object.values(products).forEach(categoryProducts => {
      categoryProducts.forEach(p => {
        const s = scoreProduct(p);
        if (s > bestScore) {
          bestScore = s;
          best = p;
        }
      });
    });

    // Require a minimal confidence
    if (best && bestScore >= 30) {
      console.log('✅ Voice selection matched:', best.name, 'score', bestScore);
      setFocusedProduct(best._id);
      // do not auto-open modal; allow actions to operate while focused
      speakVoiceFeedback(`Focused on ${best.name}`);
    } else {
      console.log('❌ No good match found for:', rawName);
      speakVoiceFeedback(`I couldn't find ${rawName}. Try saying the exact product name.`);
    }
  }, [products, speakVoiceFeedback]);

  const handleVoiceAddToCart = useCallback(() => {
    // Prefer modal-selected product, otherwise the focused product
    const getProductById = (id) => {
      if (!id) return null;
      for (const arr of Object.values(products)) {
        const p = arr.find(x => x._id === id);
        if (p) return p;
      }
      return null;
    };

    const targetProduct = selectedProduct || getProductById(focusedProduct);
    if (targetProduct) {
      console.log('🛒 Voice: Adding to cart:', targetProduct.name);
      addToCart(targetProduct);
      speakVoiceFeedback(`Added ${targetProduct.name} to your cart`);
      alert(`🛒 Added "${targetProduct.name}" to cart!`);
    } else {
      console.log('❌ No product selected or focused to add to cart');
      speakVoiceFeedback('Please select a product first by saying "select [product name]"');
      alert('🎯 Please select a product first by saying "select [product name]"');
    }
  }, [selectedProduct, focusedProduct, products, addToCart, speakVoiceFeedback]);

  const handleVoiceBuyNow = useCallback(() => {
    const getProductById = (id) => {
      if (!id) return null;
      for (const arr of Object.values(products)) {
        const p = arr.find(x => x._id === id);
        if (p) return p;
      }
      return null;
    };

    const targetProduct = selectedProduct || getProductById(focusedProduct);
    if (targetProduct) {
      console.log('💰 Voice: Buying now:', targetProduct.name);
      addToCart(targetProduct);
      speakVoiceFeedback(`Purchasing ${targetProduct.name}`);
      alert(`⚡ Purchasing "${targetProduct.name}"!`);
    } else {
      console.log('❌ No product selected to buy');
      speakVoiceFeedback('Please select a product first by saying "select [product name]"');
      alert('🎯 Please select a product first by saying "select [product name]"');
    }
  }, [selectedProduct, focusedProduct, products, addToCart, speakVoiceFeedback]);

  const closeModal = useCallback(() => {
    console.log('❌ Closing modal');
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleVoiceExit = useCallback(() => {
    console.log('🚪 Voice: Exit command received');
    if (isModalOpen) {
      closeModal();
    } else {
      console.log('ℹ️ No modal open to close');
    }
  }, [isModalOpen, closeModal]);

  // Attach voice event listeners after handlers are defined
  useEffect(() => {
    window.addEventListener('voiceSelectProduct', handleVoiceSelectProduct);
    window.addEventListener('voiceAddToCart', handleVoiceAddToCart);
    window.addEventListener('voiceBuyNow', handleVoiceBuyNow);
    window.addEventListener('voiceExit', handleVoiceExit);

    return () => {
      window.removeEventListener('voiceSelectProduct', handleVoiceSelectProduct);
      window.removeEventListener('voiceAddToCart', handleVoiceAddToCart);
      window.removeEventListener('voiceBuyNow', handleVoiceBuyNow);
      window.removeEventListener('voiceExit', handleVoiceExit);
    };
  }, [handleVoiceSelectProduct, handleVoiceAddToCart, handleVoiceBuyNow, handleVoiceExit]);

  // Fetch data once on mount. Keep this separate to avoid re-running
  // when voice handler references change (which would cause fetch loops).
  useEffect(() => {
    fetchData();
  }, []);

  const handleProductClick = (product) => {
    console.log('🖱️ Product clicked:', product.name);
    setSelectedProduct(product);
    setIsModalOpen(true);
    setFocusedProduct(null); // Reset focus when modal opens
  };

  // Get total product count
  const totalProducts = Object.values(products).reduce((total, categoryProducts) => 
    total + categoryProducts.length, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto margin-bottom"></div>
            <p className="text-cyan-300 animate-pulse">🌀 Loading Cyber Store...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex flex-col matrix-bg">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="section-padding relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto container-padding text-center relative z-10">
            <h1 className="text-6xl md:text-8xl font-black text-white margin-bottom animate-slideInTop">
              <span className="gradient-text animate-neonPulse">VOICE</span>
              <span className="text-white">MART</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-300 margin-bottom-lg max-w-3xl mx-auto animate-slideInBottom">
              🎯 THE FUTURE OF <span className="neon-text">VOICE-CONTROLLED</span> SHOPPING IS HERE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideInBottom">
              <button className="cyber-border button-padding text-white font-bold text-lg transition-all duration-300 transform hover:scale-110">
                🚀 START SHOPPING
              </button>
              <button className="glass button-padding text-cyan-300 font-bold text-lg transition-all duration-300 transform hover:scale-105">
                🎙️ VOICE COMMANDS
              </button>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        {totalProducts > 0 ? (
          <section className="section-padding">
            <div className="max-w-7xl mx-auto container-padding">
              <div className="text-center margin-bottom-lg">
                <h2 className="text-5xl font-black text-white margin-bottom-sm animate-slideInTop">
                  <span className="gradient-text">CYBER</span> PRODUCTS
                </h2>
                <p className="text-cyan-300 text-lg animate-slideInBottom">
                  {totalProducts} FUTURISTIC ITEMS READY FOR VOICE CONTROL
                </p>
              </div>

              {/* Infinite Scroll Sections - Only show categories with products */}
              {categories.map(category => (
                products[category._id] && products[category._id].length > 0 && (
                  <InfiniteScrollCards
                    key={category._id}
                    category={category}
                    products={products[category._id]}
                    onProductClick={handleProductClick}
                    focusedProduct={focusedProduct}
                  />
                )
              ))}

              {Object.keys(products).length === 0 && (
                <div className="text-center section-padding-sm">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-2xl font-bold text-white margin-bottom-sm">NO PRODUCTS YET</h3>
                  <p className="text-cyan-300">Create your first product in the admin panel!</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Empty State - No Products */
          <section className="section-padding">
            <div className="max-w-4xl mx-auto container-padding text-center">
              <div className="hologram-card rounded-3xl card-padding border border-cyan-500/30">
                <div className="text-8xl mb-6">🛸</div>
                <h2 className="text-4xl font-black text-white margin-bottom-sm neon-text">
                  STORE EMPTY
                </h2>
                <p className="text-cyan-300 text-lg margin-bottom-lg">
                  No products available yet. Admin needs to add some futuristic items!
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="cyber-border button-padding text-white font-bold">
                    🔮 COMING SOON
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Voice Command CTA */}
        <section className="section-padding bg-gradient-to-r from-black/50 to-cyan-900/20">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h2 className="text-4xl font-black text-white margin-bottom-sm">
              READY FOR <span className="gradient-text">VOICE CONTROL</span>?
            </h2>
            <p className="text-cyan-300 margin-bottom-lg text-lg">
              Click the cyber orb below and say &quot;ACTIVATE&quot; to begin voice shopping
            </p>
            <div className="hologram-card rounded-2xl card-padding max-w-2xl mx-auto border border-purple-500/30">
              <h3 className="text-white font-bold margin-bottom text-xl">VOICE COMMANDS:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-cyan-300 cyber-border p-3 rounded-lg">
                  <span className="font-bold">&quot;ACTIVATE&quot;</span> - Enable voice control
                </div>
                <div className="text-cyan-300 cyber-border p-3 rounded-lg">
                  <span className="font-bold">&quot;SCROLL DOWN&quot;</span> - Navigate page
                </div>
                <div className="text-cyan-300 cyber-border p-3 rounded-lg">
                  <span className="font-bold">&quot;SELECT [PRODUCT]&quot;</span> - Choose item
                </div>
                <div className="text-cyan-300 cyber-border p-3 rounded-lg">
                  <span className="font-bold">&quot;ADD TO CART&quot;</span> - Add to basket
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={closeModal} 
        />
      )}

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}