import React from 'react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[400px] shadow-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-medium text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          {/* Product Name */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>
          
          {/* Details */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Price</span>
              <span className="text-sm font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Stock</span>
              <span className="text-sm font-medium text-gray-900">
                {product.stock} units
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Product ID</span>
              <span className="text-sm text-gray-600">
                #{product.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
