'use client';
import { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function InfiniteScrollCards({ category, products, onProductClick, focusedProduct }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationFrameId;
    const speed = 0.5;

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += speed;
        
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      {/* Category Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-gray-400 max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-hidden py-4"
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Render products once. Doubling caused visual duplicates when product lists were small */}
          {products.map((product, index) => (
            <div
              key={`${product._id || product.id}-${index}`}
              className="flex-shrink-0 w-64"
            >
              <ProductCard 
                product={product} 
                onProductClick={onProductClick}
                isFocused={focusedProduct === product._id}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}