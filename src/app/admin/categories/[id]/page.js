'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductForm from '@/components/admin/ProductForm';
import { categoriesAPI, productsAPI } from '@/lib/api';

export default function CategoryProductsPage() {
  const params = useParams();
  const categoryId = params.id;
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      const [categoryResponse, productsResponse] = await Promise.all([
        categoriesAPI.getById(categoryId),
        productsAPI.getAll(categoryId)
      ]);

      setCategory(categoryResponse.data);
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Error fetching category data:', error);
      alert('Error loading category data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchCategoryData(); // Refresh products
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      fetchCategoryData(); // Refresh products
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-white margin-bottom-sm">Category not found</h2>
        <Link href="/admin/categories" className="text-blue-400 hover:text-blue-300">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 container-padding section-padding">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/categories" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Categories
            </Link>
            <div className="w-px h-6 bg-gray-600"></div>
            <div>
              <h1 className="text-3xl font-bold text-white">{category.name}</h1>
              {category.description && (
                <p className="text-gray-400 margin-top-sm">{category.description}</p>
              )}
            </div>
          </div>
          <p className="text-gray-400 margin-top-sm">
            {products.length} product{products.length !== 1 ? 's' : ''} in this category
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white button-padding rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          + Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl card-padding border border-gray-700/50 hover-lift group">
            <div className="relative h-48 bg-gray-700 rounded-lg overflow-hidden margin-bottom">
              <Image
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="text-lg font-bold text-white margin-bottom-sm group-hover:text-blue-300 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-gray-400 text-sm margin-bottom line-clamp-2">
              {product.shortDescription}
            </p>

            {/* Pricing */}
            <div className="space-y-2 margin-bottom">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">MRP:</span>
                <span className="text-red-400 line-through">₹{product.mrp || product.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Discount:</span>
                <span className="text-green-400">{product.discount || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Price:</span>
                <span className="text-white font-bold">₹{product.price}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <Link
                href={`/admin/products/edit/${product._id}`}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-white margin-bottom-sm">No products yet</h3>
            <p className="text-gray-400 margin-bottom">Add your first product to this category</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white button-padding rounded-lg font-medium transition-colors"
            >
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 container-padding backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="modal-padding">
              <div className="flex justify-between items-center margin-bottom">
                <h2 className="text-2xl font-bold text-white">
                  Add Product to {category.name}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ProductForm 
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
                categoryId={categoryId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}