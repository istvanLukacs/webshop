import React, { useState } from 'react';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity?: (productId: number, newQuantity: number) => void;
}

export const Cart: React.FC<CartProps> = ({ cartItems, onRemoveFromCart, onUpdateQuantity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Cart Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-medium">Cart</span>
        {totalItems > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 left-0 bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              <div className="p-2">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {onUpdateQuantity && (
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}
                      
                      <span className="text-sm font-medium px-2">
                        {item.quantity}
                      </span>
                      
                      {onUpdateQuantity && (
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button
                      onClick={() => onRemoveFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center font-semibold text-gray-900">
                <span>Total: </span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
