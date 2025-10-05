'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductForm from '../components/admin/ProductForm';
import { categoriesAPI, productsAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    activeProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);

      const products = productsResponse.data || [];
      const categories = categoriesResponse.data || [];

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        activeProducts: products.filter(p => p.isActive !== false).length,
      });

      // Get recent products (last 5)
      setRecentProducts(products.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchDashboardData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container-padding section-padding">
      {/* Header */}
      <div className="text-center margin-bottom-lg">
        <h1 className="text-4xl font-bold text-white margin-bottom-sm">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your VoiceMart store products and categories
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 margin-bottom-lg">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl card-padding border border-blue-500/20 hover-lift">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <div className="margin-left">
              <h3 className="text-lg font-semibold text-white">Total Products</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl card-padding border border-green-500/20 hover-lift">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="margin-left">
              <h3 className="text-lg font-semibold text-white">Active Products</h3>
              <p className="text-3xl font-bold text-green-400">{stats.activeProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl card-padding border border-purple-500/20 hover-lift">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
            <div className="margin-left">
              <h3 className="text-lg font-semibold text-white">Categories</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.totalCategories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-800/50 rounded-2xl card-padding border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white margin-bottom">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">➕</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Add New Product</div>
                  <div className="text-blue-200 text-sm">Create a new product with category</div>
                </div>
              </div>
              <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
            </button>

            <Link
              href="/admin/categories"
              className="block w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📁</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Manage Categories</div>
                  <div className="text-gray-400 text-sm">View and edit all categories</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-gray-800/50 rounded-2xl card-padding border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white margin-bottom">Recent Products</h3>
          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl mb-2 block">📦</span>
                No products yet
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product._id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{product.name}</div>
                    <div className="text-green-400 font-semibold">${product.price}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {product.category?.name || 'Uncategorized'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 container-padding backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="modal-padding">
              <div className="flex justify-between items-center margin-bottom">
                <h2 className="text-2xl font-bold text-white">Add New Product</h2>
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}