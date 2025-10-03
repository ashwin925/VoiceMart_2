'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import InfiniteScrollCards from './components/ui/InfiniteScrollCards';
import ProductModal from './components/ui/ProductModal';
import VoiceAssistant from './components/ui/VoiceAssistant';
import { categoriesAPI, productsAPI } from '@/lib/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focusedProduct, setFocusedProduct] = useState(null);
  
  const productRefs = useRef(new Map());

  useEffect(() => {
    fetchData();
    setupVoiceEventListeners();

    return () => {
      cleanupVoiceEventListeners();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await categoriesAPI.getAll();
      const categoriesData = categoriesResponse.data || [];
      setCategories(categoriesData);

      // Fetch products for each category
      const productsByCategory = {};
      for (const category of categoriesData) {
        try {
          const productsResponse = await productsAPI.getAll(category._id);
          productsByCategory[category._id] = productsResponse.data || [];
        } catch (error) {
          console.error(`Error fetching products for category ${category.name}:`, error);
          productsByCategory[category._id] = [];
        }
      }
      
      setProducts(productsByCategory);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setCategories([
        {
          _id: '1',
          name: 'Electronics',
          description: 'Latest gadgets and electronics'
        },
        {
          _id: '2',
          name: 'Fashion',
          description: 'Trendy clothing and accessories'
        }
      ]);
      setProducts({
        '1': [
          {
            _id: '1',
            name: 'Wireless Bluetooth Headphones',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
            shortDescription: 'High-quality wireless headphones with noise cancellation',
            price: 99.99
          },
          {
            _id: '2',
            name: 'Smart Watch',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
            shortDescription: 'Feature-rich smartwatch with health monitoring',
            price: 199.99
          },
          {
            _id: '3',
            name: 'Laptop Stand',
            imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
            shortDescription: 'Adjustable aluminum laptop stand for better ergonomics',
            price: 49.99
          }
        ],
        '2': [
          {
            _id: '4',
            name: 'Casual T-Shirt',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
            shortDescription: 'Comfortable cotton t-shirt for everyday wear',
            price: 24.99
          },
          {
            _id: '5',
            name: 'Running Shoes',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
            shortDescription: 'Lightweight running shoes with great cushioning',
            price: 89.99
          },
          {
            _id: '6',
            name: 'Designer Jeans',
            imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
            shortDescription: 'Premium quality jeans with perfect fit',
            price: 79.99
          }
        ]
      });
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

  const handleVoiceSelectProduct = (event) => {
    const productName = event.detail.productName.toLowerCase();
    console.log('🎯 Voice selecting product:', productName);
    
    // Find product across all categories
    let foundProduct = null;
    Object.values(products).forEach(categoryProducts => {
      const product = categoryProducts.find(p => 
        p.name.toLowerCase().includes(productName)
      );
      if (product) foundProduct = product;
    });

    if (foundProduct) {
      console.log('✅ Product found:', foundProduct.name);
      setFocusedProduct(foundProduct._id);
      
      // Auto-click the product after a short delay
      setTimeout(() => {
        handleProductClick(foundProduct);
      }, 1000);
    } else {
      console.log('❌ Product not found:', productName);
    }
  };

  const handleVoiceAddToCart = () => {
    if (selectedProduct) {
      console.log('🛒 Voice: Adding to cart:', selectedProduct.name);
      // Add to cart logic here
      alert(`Added "${selectedProduct.name}" to cart!`);
    } else {
      console.log('❌ No product selected to add to cart');
      alert('Please select a product first by saying "select [product name]"');
    }
  };

  const handleVoiceBuyNow = () => {
    if (selectedProduct) {
      console.log('💰 Voice: Buying now:', selectedProduct.name);
      // Buy now logic here
      alert(`Purchasing "${selectedProduct.name}"!`);
    } else {
      console.log('❌ No product selected to buy');
      alert('Please select a product first by saying "select [product name]"');
    }
  };

  const handleVoiceExit = () => {
    console.log('🚪 Voice: Exit command received');
    if (isModalOpen) {
      closeModal();
    } else {
      console.log('ℹ️ No modal open to close');
    }
  };

  const handleProductClick = (product) => {
    console.log('🖱️ Product clicked:', product.name);
    setSelectedProduct(product);
    setIsModalOpen(true);
    setFocusedProduct(null); // Reset focus when modal opens
  };

  const closeModal = () => {
    console.log('❌ Closing modal');
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 section-padding">
          <div className="max-w-7xl mx-auto container-padding text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white margin-bottom">
              Welcome to <span className="text-blue-400">VoiceMart</span>
            </h1>
            <p className="text-xl text-gray-300 margin-bottom-lg max-w-3xl mx-auto">
              Experience the future of accessible shopping. Control everything with your voice - 
              from browsing products to making purchases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white button-padding rounded-lg font-semibold transition-colors">
                Start Shopping
              </button>
              <button className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white button-padding rounded-lg font-semibold transition-colors">
                Learn Voice Commands
              </button>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center margin-bottom-lg">
              <h2 className="text-4xl font-bold text-white margin-bottom-sm">
                Featured Categories
              </h2>
              <p className="text-gray-400 text-lg">
                Browse our wide range of products with voice-enabled navigation
              </p>
            </div>

            {/* Infinite Scroll Sections */}
            {categories.map(category => (
              <InfiniteScrollCards
                key={category._id}
                category={category}
                products={products[category._id] || []}
                onProductClick={handleProductClick}
                focusedProduct={focusedProduct}
              />
            ))}

            {categories.length === 0 && (
              <div className="text-center section-padding-sm">
                <p className="text-gray-400 text-lg">No categories found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Voice Command CTA */}
        <section className="bg-gray-800 section-padding">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h2 className="text-3xl font-bold text-white margin-bottom-sm">
              Ready to Shop Hands-Free?
            </h2>
            <p className="text-gray-300 margin-bottom-lg">
              Click the microphone icon in the bottom right and say &quot;listen now&quot; to activate voice commands.
            </p>
            <div className="bg-gray-700 rounded-lg card-padding max-w-2xl mx-auto">
              <h3 className="text-white font-semibold margin-bottom">Try These Commands:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;listen now&quot;</span> - Activate voice control
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;scroll down&quot;</span> - Scroll down the page
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;select headphones&quot;</span> - Focus on a product
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;add to cart&quot;</span> - Add focused item to cart
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;buy now&quot;</span> - Purchase focused item
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">&quot;stop listening&quot;</span> - Pause voice commands
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