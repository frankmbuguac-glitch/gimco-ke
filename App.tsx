import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { CATALOG, MOCK_ORDERS, MOCK_USER, MOCK_CUSTOMERS } from './constants';
import { CartItem, CatalogItem, ItemCategory, ItemType, Order, OrderItem, PaymentStatus, ProductLogisticsStage, ServiceStage, User, Occasion } from './types';
import { TrackingVisualizer } from './components/TrackingVisualizer';
import { AIChat } from './components/AIChat';
import { AdminDashboard } from './components/AdminDashboard';
import { MPESAModal } from './components/MPESAModal';
import { MeasurementGuide } from './components/MeasurementGuide';
import { ProductDetailModal } from './components/ProductDetailModal';

// --- COMPONENTS (Inline for structural simplicity in this prompt format, typically would be separate) ---

const Navbar = ({ cartCount, user, wishlistCount }: { cartCount: number, user: User, wishlistCount: number }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-brand-500 font-semibold' : 'text-gray-600 hover:text-brand-800';

  // Simple mock check for admin rights - in real app, use roles
  const isAdmin = user.name === 'Kevin Kamau'; 

  return (
    <nav className="bg-white border-b border-brand-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <i className="fas fa-vest text-brand-700 text-2xl"></i>
              <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">GIMCO KE</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Shop Catalog</Link>
            <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
            <Link to="/profile" className={isActive('/profile')}>Measurements</Link>
            {isAdmin && <Link to="/admin" className="text-brand-800 font-bold px-3 py-1 bg-brand-50 rounded-full border border-brand-200">Admin Panel</Link>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative p-2 text-gray-600">
               <i className="far fa-heart text-xl"></i>
               {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {wishlistCount}
                  </span>
               )}
            </div>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-800">
              <i className="fas fa-shopping-bag text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 font-bold border border-brand-300 uppercase">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- PAGES ---

interface CatalogPageProps {
  catalog: CatalogItem[];
  addToCart: (item: CatalogItem) => void;
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
}

const CatalogPage = ({ catalog, addToCart, wishlist, toggleWishlist }: CatalogPageProps) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ItemCategory>('ALL');
  const [occasionFilter, setOccasionFilter] = useState<'ALL' | Occasion>('ALL');
  
  // Price Logic
  const maxCatalogPrice = useMemo(() => Math.max(...catalog.map(i => i.price)), [catalog]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxCatalogPrice]);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('jimco_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load recently viewed", e);
      return [];
    }
  });

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    
    // Update recently viewed
    setRecentlyViewed(prev => {
        // Remove duplicate if exists
        const filtered = prev.filter(i => i.id !== item.id);
        // Add to front, cap at 5
        const updated = [item, ...filtered].slice(0, 5);
        localStorage.setItem('jimco_recently_viewed', JSON.stringify(updated));
        return updated;
    });
  };

  const filteredItems = catalog.filter(item => {
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchOccasion = occasionFilter === 'ALL' || (item.occasions && item.occasions.includes(occasionFilter));
      const matchPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      return matchCategory && matchOccasion && matchPrice;
  });

  const occasions: Occasion[] = [
      'Business Formal', 
      'Business Casual', 
      'Smart Casual', 
      'Traditional Wear', 
      'Wedding', 
      'Burial', 
      'Corporate Branding'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">The Collection</h1>
            <p className="text-gray-500 mt-1">Curated elegance for the modern Kenyan.</p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Section */}
            <div className="w-full lg:w-1/4 space-y-6">
                {/* Category Filter */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Categories</h3>
                    <div className="flex flex-col space-y-2">
                        {['ALL', 'MEN', 'WOMEN', 'ACCESSORIES'].map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="category"
                                    checked={categoryFilter === cat}
                                    onChange={() => setCategoryFilter(cat as any)}
                                    className="text-brand-600 focus:ring-brand-500"
                                />
                                <span className={`text-sm ${categoryFilter === cat ? 'text-brand-700 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Filter */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Price Range</h3>
                    <div className="px-2">
                        <input 
                            type="range" 
                            min="0" 
                            max={maxCatalogPrice} 
                            step="500"
                            value={priceRange[1]} 
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                        <div className="flex justify-between text-xs font-bold text-gray-600 mt-2">
                            <span>KES 0</span>
                            <span>KES {priceRange[1].toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Occasion Filter */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Occasion</h3>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setOccasionFilter('ALL')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${occasionFilter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Any
                        </button>
                        {occasions.map(occ => (
                            <button
                                key={occ}
                                onClick={() => setOccasionFilter(occ)}
                                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${occasionFilter === occ ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100'}`}
                            >
                                {occ}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="flex-1">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
                        <p className="text-gray-500 text-lg">No items match your selected filters.</p>
                        <button onClick={() => { setCategoryFilter('ALL'); setOccasionFilter('ALL'); setPriceRange([0, maxCatalogPrice]); }} className="mt-4 text-brand-600 font-bold hover:underline">Clear All Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                        <div key={item.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col relative">
                            {/* Wishlist Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }}
                                className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                                    wishlist.has(item.id) 
                                    ? 'bg-white text-red-500 scale-110' 
                                    : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white'
                                }`}
                            >
                                <i className={`${wishlist.has(item.id) ? 'fas' : 'far'} fa-heart`}></i>
                            </button>

                            <div 
                                className="h-64 overflow-hidden relative cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${
                                    item.type === ItemType.SERVICE ? 'bg-brand-100 text-brand-900' : 'bg-emerald-100 text-emerald-900'
                                    }`}>
                                    {item.type}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                                        Quick View
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={() => handleItemClick(item)}>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900 font-serif line-clamp-1">{item.name}</h3>
                                    <span className="text-brand-700 font-bold whitespace-nowrap">KES {item.price.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase mt-1 mb-2">{item.category}</p>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                        className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <i className="fas fa-plus"></i>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fas fa-history text-brand-500"></i> Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.map(item => (
                <div 
                  key={`rv-${item.id}`} 
                  onClick={() => handleItemClick(item)}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="h-40 overflow-hidden relative">
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                     {/* Overlay on hover */}
                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-3">
                     <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                     <p className="text-brand-600 font-bold text-xs mt-1">KES {item.price.toLocaleString()}</p>
                     <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
        isWishlisted={selectedItem ? wishlist.has(selectedItem.id) : false}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
};

const OrdersPage = ({ orders }: { orders: Order[] }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to check if order is active
  const isOrderActive = (order: Order) => {
    return order.items.some(item => {
      if (item.catalogItem.type === ItemType.SERVICE) {
        return item.status !== ServiceStage.COMPLETED;
      }
      return item.status !== ProductLogisticsStage.DELIVERED;
    });
  };

  const filteredOrders = orders.filter(order => {
    // Tab Filter
    const isActive = isOrderActive(order);
    if (activeTab === 'ACTIVE' && !isActive) return false;
    if (activeTab === 'HISTORY' && isActive) return false;

    // Search Filter
    const query = searchQuery.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(query);
    const matchesItem = order.items.some(i => i.catalogItem.name.toLowerCase().includes(query));
    return matchesId || matchesItem;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-gray-900">My Orders</h1>
           <p className="text-gray-500 mt-1">Track your bespoke journeys and deliveries.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:min-w-[250px]">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Search order # or item..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent w-full"
                />
            </div>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex-shrink-0">
                <button 
                  onClick={() => setActiveTab('ACTIVE')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-brand-600 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setActiveTab('HISTORY')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  History
                </button>
            </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">
                 <i className={`fas ${activeTab === 'ACTIVE' ? 'fa-box-open' : 'fa-history'}`}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No {activeTab.toLowerCase()} orders found</h3>
              <p className="text-gray-500">
                {activeTab === 'ACTIVE' ? "You don't have any orders in progress." : "Your past orders will appear here."}
              </p>
           </div>
        ) : (
           filteredOrders.map(order => (
             <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order Placed</span>
                      <span className="text-sm font-bold text-gray-900">{new Date(order.date).toLocaleDateString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                      <span className="text-sm font-bold text-gray-900">KES {order.totalAmount.toLocaleString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order #</span>
                      <span className="text-sm font-mono text-gray-700">{order.id}</span>
                   </div>
                   <div className="ml-auto flex items-center gap-3">
                      <button onClick={() => alert(`Downloading Invoice for ${order.id}`)} className="text-sm font-bold text-brand-700 hover:underline">
                         <i className="fas fa-file-invoice mr-1"></i> Invoice
                      </button>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <button onClick={() => alert(`Connecting to support for ${order.id}`)} className="text-sm font-bold text-gray-500 hover:text-gray-800">
                         Need Help?
                      </button>
                   </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                   {order.items.map(item => (
                      <div key={item.id} className="p-6">
                         <div className="flex flex-col md:flex-row gap-6">
                            {/* Product Info */}
                            <div className="flex gap-4 md:w-1/3">
                               <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                  <img src={item.catalogItem.image} alt={item.catalogItem.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <h4 className="font-bold text-gray-900 line-clamp-2">{item.catalogItem.name}</h4>
                                   <p className="text-xs text-gray-500 mt-1">{item.catalogItem.type} • {item.catalogItem.category}</p>
                                   <p className="text-sm font-bold text-brand-700 mt-2">KES {item.catalogItem.price.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Tracking Info */}
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-2">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                                     item.catalogItem.type === ItemType.SERVICE ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                     {item.status.replace(/_/g, ' ')}
                                  </span>
                                  {item.estimatedDelivery && (
                                     <span className="text-xs font-semibold text-gray-500">
                                        <i className="fas fa-calendar-alt mr-1"></i> Est: {item.estimatedDelivery}
                                     </span>
                                  )}
                               </div>
                               
                               <TrackingVisualizer type={item.catalogItem.type} status={item.status} />

                               {/* Service Specifics */}
                               {item.catalogItem.type === ItemType.SERVICE && item.customMeasurements && (
                                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-600">
                                     <p className="font-bold mb-1 text-gray-800">Tailoring Profile Used:</p>
                                     <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <span>Chest: {item.customMeasurements.chest}"</span>
                                        <span>Waist: {item.customMeasurements.waist}"</span>
                                        <span>Inseam: {item.customMeasurements.inseam}"</span>
                                        <span>Sleeve: {item.customMeasurements.sleeve}"</span>
                                     </div>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

const ProfilePage = ({ user, setUser }: { user: User, setUser: React.Dispatch<React.SetStateAction<User>> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user.measurements);

  const handleSave = () => {
    setUser({ ...user, measurements: formData });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
         <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-serif uppercase">
            {user.name.split(' ').map(n => n[0]).join('')}
         </div>
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-brand-100 overflow-hidden">
        <div className="bg-brand-50 px-6 py-4 border-b border-brand-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-900 font-serif">
            <i className="fas fa-ruler-vertical mr-2"></i>
            Body Measurements
          </h2>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isEditing ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm text-gray-500 mb-6 bg-blue-50 text-blue-800 p-3 rounded">
            <i className="fas fa-info-circle mr-2"></i>
            These measurements will be automatically applied to any "Custom Service" items you add to your cart.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
               <MeasurementGuide 
                 key={key}
                 label={key}
                 field={key}
                 value={formData[key]}
                 onChange={(val) => setFormData(prev => ({...prev, [key]: val}))}
                 disabled={!isEditing}
               />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ cart, clearCart, user, addOrder }: { cart: CartItem[], clearCart: () => void, user: User, addOrder: (cart: CartItem[]) => void }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-shopping-basket text-gray-400 text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 mb-6">Explore our collection of bespoke services and luxury goods.</p>
        <Link to="/" className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 font-semibold">
          Start Shopping
        </Link>
      </div>
    );
  }

  const handlePaymentSuccess = () => {
      addOrder(cart);
      clearCart();
      setIsPaymentOpen(false);
      navigate('/orders');
  };

  const handleClearCart = () => {
    clearCart();
    setIsConfirmingClear(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Shopping Cart</h1>
        <button 
          onClick={() => setIsConfirmingClear(true)}
          className="text-red-600 text-sm font-bold hover:underline"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="font-bold text-gray-900">KES {item.price.toLocaleString()}</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                   <span className={`text-xs px-2 py-0.5 rounded ${
                     item.type === ItemType.SERVICE ? 'bg-brand-100 text-brand-800' : 'bg-emerald-100 text-emerald-800'
                   }`}>
                     {item.type}
                   </span>
                   <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                     {item.category}
                   </span>
                </div>
                {item.type === ItemType.SERVICE && (
                   <p className="text-xs text-gray-500 mt-2">
                     <i className="fas fa-check mr-1 text-green-500"></i>
                     Will be linked to your current measurements profile.
                   </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Tax (16% VAT Estimated)</span>
              <span>KES {(total * 0.16).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-xl text-gray-900 mb-6">
              <span>Total</span>
              <span>KES {(total * 1.16).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <button 
              onClick={() => setIsPaymentOpen(true)}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fas fa-mobile-alt"></i> Pay with M-PESA
            </button>
          </div>
        </div>
      </div>

      <MPESAModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        amount={total * 1.16}
        onSuccess={handlePaymentSuccess}
      />

      {/* Confirmation Modal */}
      {isConfirmingClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trash text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Shopping Cart?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsConfirmingClear(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearCart}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP ---

const App = () => {
  // Lifted state to support Admin and Dynamic behavior
  const [user, setUser] = useState<User>(MOCK_USER);
  const [catalog, setCatalog] = useState<CatalogItem[]>(CATALOG);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<User[]>(MOCK_CUSTOMERS);
  
  // Wishlist State
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const addToCart = (item: CatalogItem) => {
    setCart([...cart, { ...item, cartId: Math.random().toString(36).substr(2, 9) }]);
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (id: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(id)) {
      newWishlist.delete(id);
    } else {
      newWishlist.add(id);
    }
    setWishlist(newWishlist);
  };

  const addOrder = (cartItems: CartItem[]) => {
      const newOrder: Order = {
          id: `ord-${Math.floor(Math.random() * 10000)}`,
          userId: user.id,
          customerName: user.name,
          customerPhone: user.phone || 'N/A',
          date: new Date().toISOString(),
          totalAmount: cartItems.reduce((acc, i) => acc + i.price, 0),
          paymentStatus: PaymentStatus.PAID,
          items: cartItems.map((c, idx) => ({
              id: `oi-new-${idx}`,
              orderId: `temp`,
              catalogItem: c,
              quantity: 1,
              status: c.type === ItemType.SERVICE ? ServiceStage.MEASUREMENTS_PENDING : ProductLogisticsStage.ORDER_PLACED,
              customMeasurements: c.type === ItemType.SERVICE ? { ...user.measurements } : undefined
          }))
      };
      setOrders([newOrder, ...orders]);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar cartCount={cart.length} user={user} wishlistCount={wishlist.size} />
        
        <Routes>
          <Route path="/" element={
            <CatalogPage 
              catalog={catalog} 
              addToCart={addToCart} 
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          } />
          <Route path="/orders" element={<OrdersPage orders={orders} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/cart" element={<CartPage cart={cart} clearCart={clearCart} user={user} addOrder={addOrder} />} />
          <Route path="/admin" element={<AdminDashboard catalog={catalog} orders={orders} customers={customers} setCatalog={setCatalog} setOrders={setOrders} />} />
        </Routes>

        <AIChat user={user} />
        
        <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
           <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="font-serif italic text-2xl text-gray-200 mb-4">GIMCO KE</p>
              <p className="text-sm">Excellence in tailoring since 2024. Nairobi, Kenya.</p>
           </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;