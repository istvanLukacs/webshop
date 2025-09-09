import React from 'react';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  availableStock?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onView, 
  onEdit, 
  onDelete, 
  onAddToCart, 
  availableStock 
}) => {
  const stockToShow = availableStock !== undefined ? availableStock : product.stock;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Add to Cart Button - Top Right */}
      <button
        onClick={() => onAddToCart(product)}
        disabled={stockToShow === 0}
        className={`absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          stockToShow === 0 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <Plus className="w-4 h-4 text-white" />
      </button>

      {/* Product Title */}
      <div className="mb-4 pr-10">
        <h4 className="text-base font-medium text-gray-900 leading-tight mb-2">
          {product.name}
        </h4>
        
        {/* Description */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 leading-relaxed overflow-hidden text-ellipsis whitespace-normal" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.description || 'No description available'}
          </p>
        </div>
        
        {/* Stock and Price */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Stock: {stockToShow}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(product)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        
        <button
          onClick={() => onEdit(product)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        
        <button
          onClick={() => onDelete(product)}
          className="flex items-center justify-center w-9 h-8 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
