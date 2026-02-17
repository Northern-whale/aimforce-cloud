"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  origin: string;
  price: number;
  priceUSD?: number;
  strength: string;
  length?: number;
  inStock: boolean;
  stock: number;
  description?: string;
  category: string;
  totalMentions: number;
  recentMentions: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("mentions");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      if (filter === "all") return true;
      if (filter === "cuban") return p.origin === "Cuban";
      if (filter === "dominican") return p.origin === "Dominican";
      if (filter === "nicaraguan") return p.origin === "Nicaraguan";
      if (filter === "trending") return p.recentMentions > 0;
      if (filter === "low-stock") return p.stock < 20;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "mentions") return b.totalMentions - a.totalMentions;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "stock") return a.stock - b.stock;
      return 0;
    });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.inStock).length,
    trending: products.filter((p) => p.recentMentions > 0).length,
    lowStock: products.filter((p) => p.stock < 20).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Product Inventory</h1>
        <p className="text-gray-400">Manage your cigar inventory and track customer interest</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Stock</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.inStock}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Trending</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.trending}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.lowStock}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("cuban")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "cuban"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Cuban
          </button>
          <button
            onClick={() => setFilter("dominican")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "dominican"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Dominican
          </button>
          <button
            onClick={() => setFilter("nicaraguan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "nicaraguan"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Nicaraguan
          </button>
          <button
            onClick={() => setFilter("trending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "trending"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setFilter("low-stock")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "low-stock"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Low Stock
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 text-sm"
        >
          <option value="mentions">Most Mentioned</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
          <option value="stock">Stock Level</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-700 text-gray-300">
                    {product.origin}
                  </span>
                  {product.recentMentions > 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-purple-600 text-white flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.brand}</p>
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-400">Price:</span>
                <p className="text-white font-semibold">{product.price.toLocaleString()} ₽</p>
              </div>
              <div>
                <span className="text-gray-400">Stock:</span>
                <p
                  className={`font-semibold ${
                    product.stock < 20 ? "text-orange-500" : "text-green-500"
                  }`}
                >
                  {product.stock} units
                </p>
              </div>
              <div>
                <span className="text-gray-400">Strength:</span>
                <p className="text-white">{product.strength}</p>
              </div>
              <div>
                <span className="text-gray-400">Category:</span>
                <p className="text-white capitalize">{product.category}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Customer Interest:</span>
                <span className="text-white font-semibold">
                  {product.totalMentions} mentions
                  {product.recentMentions > 0 && (
                    <span className="text-purple-400 ml-1">({product.recentMentions} recent)</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No products found with current filters</p>
        </div>
      )}
    </div>
  );
}
