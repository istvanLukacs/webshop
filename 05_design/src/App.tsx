import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Product, ProductCreate, ProductUpdate, CartItem } from './types';
import { productService, cartService } from './services/api';
import { ProductCard } from './components/ProductCard';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { DeleteProductModal } from './components/DeleteProductModal';
import { Cart } from './components/Cart';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [availableStocks, setAvailableStocks] = useState<{[key: number]: number}>({});
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('cart_session_id');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('cart_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Load products and cart on component mount
  useEffect(() => {
    if (sessionId) {
      loadProducts();
      loadCart();
    }
  }, [sessionId]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      
      // Load available stocks for each product
      if (sessionId) {
        const stocks: {[key: number]: number} = {};
        const stockPromises = data.map(async (product) => {
          try {
            const availableStock = await cartService.getAvailableStock(sessionId, product.id);
            return { id: product.id, stock: availableStock };
          } catch (error) {
            console.error(`Failed to load stock for product ${product.id}:`, error);
            return { id: product.id, stock: product.stock };
          }
        });
        const stockResults = await Promise.all(stockPromises);
        stockResults.forEach(({ id, stock }) => {
          stocks[id] = stock;
        });
        setAvailableStocks(stocks);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!sessionId) return;
    
    try {
      const cartData = await cartService.getCart(sessionId);
      setCartItems(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleAddProduct = async (productData: ProductCreate) => {
    try {
      setLoading(true);
      await productService.create(productData);
      setShowAddModal(false);
      await loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id: number, productData: ProductUpdate) => {
    try {
      setLoading(true);
      await productService.update(id, productData);
      setShowEditModal(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      await productService.delete(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await loadProducts();
      await loadCart(); // Refresh cart in case deleted product was in cart
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!sessionId) return;
    
    try {
      await cartService.addToCart({ product_id: product.id, session_id: sessionId });
      await loadCart();
      await loadProducts(); // Refresh to update available stocks
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart. Please check stock availability.');
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    if (!sessionId) return;
    
    try {
      await cartService.removeFromCart(sessionId, productId);
      await loadCart();
      await loadProducts(); // Refresh to update available stocks
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Product Management
        </h1>
        
        {/* Search and Add Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
        
        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteClick}
                onAddToCart={handleAddToCart}
                availableStock={availableStocks[product.id]}
              />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </div>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        isLoading={loading}
      />
      
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onUpdate={handleUpdateProduct}
        product={selectedProduct}
        isLoading={loading}
      />
      
      <ProductDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
      
      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onDelete={handleDeleteProduct}
        product={selectedProduct}
        isLoading={loading}
      />

      {/* Cart */}
      <Cart
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
}

export default App;
