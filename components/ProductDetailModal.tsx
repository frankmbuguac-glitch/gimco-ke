import React, { useState } from 'react';
import { CatalogItem, ItemType, ServiceStage } from '../types';

interface ProductDetailModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CatalogItem) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  item, isOpen, onClose, onAddToCart, isWishlisted, onToggleWishlist 
}) => {
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  if (!isOpen || !item) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)' // Zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Image Section with Zoom */}
        <div className="w-full md:w-1/2 bg-gray-100 relative overflow-hidden group h-64 md:h-auto cursor-zoom-in">
          <div 
            className="w-full h-full transition-transform duration-200 ease-out"
            style={zoomStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
             <img 
               src={item.image} 
               alt={item.name} 
               className="w-full h-full object-cover" 
             />
          </div>
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
            <i className="fas fa-search-plus mr-1"></i> Hover to Zoom
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="mb-6">
             <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                   item.type === ItemType.SERVICE ? 'bg-brand-100 text-brand-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                   {item.type}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.category}</span>
             </div>
             <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{item.name}</h2>
             <p className="text-2xl font-bold text-brand-700">KES {item.price.toLocaleString()}</p>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

          <div className="space-y-4 mt-auto">
             {item.occasions && (
                <div>
                   <h4 className="text-sm font-bold text-gray-900 uppercase mb-2">Perfect For</h4>
                   <div className="flex flex-wrap gap-2">
                      {item.occasions.map(occ => (
                         <span key={occ} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            {occ}
                         </span>
                      ))}
                   </div>
                </div>
             )}

             {item.type === ItemType.SERVICE && (
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-lg">
                   <h4 className="text-sm font-bold text-brand-900 mb-1"><i className="fas fa-ruler-combined mr-2"></i>Tailored Service</h4>
                   <p className="text-xs text-brand-800">
                      This item requires your body measurements. We will use your profile measurements during the <strong>{ServiceStage.MEASUREMENTS_PENDING}</strong> stage.
                   </p>
                </div>
             )}

             <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => { onAddToCart(item); onClose(); }}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-brand-700 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-shopping-bag"></i> Add to Cart
                </button>
                <button 
                  onClick={() => onToggleWishlist(item.id)}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl transition-all border ${
                    isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500' 
                    : 'bg-white border-gray-300 text-gray-400 hover:text-gray-600'
                  }`}
                >
                   <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};