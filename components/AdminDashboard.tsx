import React, { useState, useRef } from 'react';
import { CatalogItem, ItemCategory, ItemType, Order, OrderItem, PaymentStatus, ServiceStage, ProductLogisticsStage, CatalogItemHistory, User } from '../types';
import { generateInventoryImage } from '../services/geminiService';

interface AdminDashboardProps {
  catalog: CatalogItem[];
  orders: Order[];
  customers: User[]; // Added customers prop
  setCatalog: (items: CatalogItem[]) => void;
  setOrders: (orders: Order[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ catalog, orders, customers, setCatalog, setOrders }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'INVENTORY' | 'CUSTOMERS'>('OVERVIEW');
  
  // --- Inventory State ---
  const [inventoryView, setInventoryView] = useState<'LIST' | 'GRID'>('LIST');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [itemForm, setItemForm] = useState<Partial<CatalogItem>>({ type: ItemType.PRODUCT, category: 'ACCESSORIES', price: 0, image: '' });
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilterType, setInventoryFilterType] = useState<ItemType | 'ALL'>('ALL');
  const [inventoryFilterCategory, setInventoryFilterCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showingHistoryId, setShowingHistoryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Order State ---
  const [orderFilterStatus, setOrderFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [orderSort, setOrderSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedDetailItem, setSelectedDetailItem] = useState<{ item: OrderItem, orderId: string } | null>(null);

  // --- Customer State ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // --- Calculations for Overview ---
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const serviceOrders = orders.filter(o => o.items.some(i => i.catalogItem.type === ItemType.SERVICE)).length;
  const productOrders = orders.filter(o => o.items.some(i => i.catalogItem.type === ItemType.PRODUCT)).length;

  // Mock Data for Chart
  const chartData = [
    { day: 'Mon', value: totalRevenue * 0.1 },
    { day: 'Tue', value: totalRevenue * 0.15 },
    { day: 'Wed', value: totalRevenue * 0.2 },
    { day: 'Thu', value: totalRevenue * 0.12 },
    { day: 'Fri', value: totalRevenue * 0.25 },
    { day: 'Sat', value: totalRevenue * 0.18 },
    { day: 'Sun', value: totalRevenue * 0.05 }, // Mock distribution
  ];
  const maxChartVal = Math.max(...chartData.map(d => d.value)) || 10000;

  // --------------------------------------------------------------------------------
  // INVENTORY LOGIC
  // --------------------------------------------------------------------------------

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) return;

    setIsSaving(true);

    let finalImage = itemForm.image;

    // Automatic Image Generation if URL is missing
    if (!finalImage) {
        try {
            const generated = await generateInventoryImage(
                itemForm.name, 
                itemForm.category || 'ACCESSORIES', 
                itemForm.type || ItemType.PRODUCT
            );
            if (generated) {
                finalImage = generated;
            } else {
                finalImage = 'https://via.placeholder.com/400?text=No+Image';
            }
        } catch (e) {
            console.error("Auto-generation failed", e);
            finalImage = 'https://via.placeholder.com/400?text=No+Image';
        }
    }

    if (editingItem) {
        // Track changes
        const changes: string[] = [];
        if (editingItem.price !== itemForm.price) changes.push(`Price: ${editingItem.price} -> ${itemForm.price}`);
        if (editingItem.name !== itemForm.name) changes.push(`Name updated`);
        if (editingItem.description !== itemForm.description) changes.push(`Description updated`);
        if (editingItem.image !== finalImage) changes.push(`Image updated`);
        if (editingItem.category !== itemForm.category) changes.push(`Category: ${editingItem.category} -> ${itemForm.category}`);
        
        const newHistoryEntry: CatalogItemHistory = {
            date: new Date().toISOString(),
            change: changes.length > 0 ? changes.join(', ') : 'Updated item details'
        };

        const updatedHistory = [...(editingItem.history || []), newHistoryEntry];

        const updatedCatalog = catalog.map(item => 
            item.id === editingItem.id 
            ? { ...item, ...itemForm, image: finalImage, history: updatedHistory } as CatalogItem 
            : item
        );
        setCatalog(updatedCatalog);
        setEditingItem(null);
    } else {
        const item: CatalogItem = {
            id: `new-${Date.now()}`,
            name: itemForm.name!,
            description: itemForm.description || '',
            price: itemForm.price!,
            type: itemForm.type || ItemType.PRODUCT,
            category: itemForm.category || 'ACCESSORIES',
            image: finalImage!,
            history: [{ date: new Date().toISOString(), change: 'Item created' }]
        };
        setCatalog([...catalog, item]);
    }
    
    // Reset form
    setItemForm({ type: ItemType.PRODUCT, category: 'ACCESSORIES', price: 0, name: '', description: '', image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsSaving(false);
  };

  const handleGenerateAIImage = async () => {
      if (!itemForm.name) {
          alert("Please enter an item name first.");
          return;
      }
      setIsGeneratingImage(true);
      try {
          const base64Image = await generateInventoryImage(
              itemForm.name, 
              itemForm.category || 'ACCESSORIES', 
              itemForm.type || ItemType.PRODUCT
          );
          if (base64Image) {
              setItemForm(prev => ({ ...prev, image: base64Image }));
          } else {
              alert("Could not generate image. Please try again or check API key.");
          }
      } catch (e) {
          alert("Error generating image.");
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setItemForm(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const filteredInventory = catalog.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesType = inventoryFilterType === 'ALL' || item.type === inventoryFilterType;
      const matchesCategory = inventoryFilterCategory === 'ALL' || item.category === inventoryFilterCategory;
      return matchesSearch && matchesType && matchesCategory;
  });

  const handleEditClick = (item: CatalogItem) => {
      setEditingItem(item);
      setItemForm({ ...item });
      const formElement = document.getElementById('inventory-form');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingItem(null);
      setItemForm({ type: ItemType.PRODUCT, category: 'ACCESSORIES', price: 0, name: '', description: '', image: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
        setCatalog(catalog.filter(i => i.id !== id));
    }
  };

  // --------------------------------------------------------------------------------
  // ORDERS LOGIC
  // --------------------------------------------------------------------------------

  const updateOrderStatus = (orderId: string, itemId: string, newStatus: string) => {
      const updatedOrders = orders.map(order => {
          if (order.id !== orderId) return order;
          return {
              ...order,
              items: order.items.map(item => {
                  if (item.id !== itemId) return item;
                  return { ...item, status: newStatus as any };
              })
          };
      });
      setOrders(updatedOrders);
  };

  const updateEstimatedDelivery = (orderId: string, itemId: string, date: string) => {
      const updatedOrders = orders.map(order => {
        if (order.id !== orderId) return order;
        return {
            ...order,
            items: order.items.map(item => {
                if (item.id !== itemId) return item;
                return { ...item, estimatedDelivery: date };
            })
        };
      });
      setOrders(updatedOrders);
      if (selectedDetailItem && selectedDetailItem.orderId === orderId && selectedDetailItem.item.id === itemId) {
          setSelectedDetailItem(prev => prev ? ({ ...prev, item: { ...prev.item, estimatedDelivery: date } }) : null);
      }
  };

  // Bulk Actions
  const toggleOrderSelection = (orderId: string) => {
      const newSelected = new Set(selectedOrders);
      if (newSelected.has(orderId)) {
          newSelected.delete(orderId);
      } else {
          newSelected.add(orderId);
      }
      setSelectedOrders(newSelected);
  };

  const handleBulkAction = (action: string) => {
      if (selectedOrders.size === 0) return;

      let updatedOrders = [...orders];

      switch (action) {
          case 'MARK_PAID':
              updatedOrders = updatedOrders.map(o => selectedOrders.has(o.id) ? { ...o, paymentStatus: PaymentStatus.PAID } : o);
              break;
          case 'MARK_PENDING':
              updatedOrders = updatedOrders.map(o => selectedOrders.has(o.id) ? { ...o, paymentStatus: PaymentStatus.PENDING } : o);
              break;
          case 'SET_PRODUCTS_SHIPPED':
              updatedOrders = updatedOrders.map(o => {
                  if (!selectedOrders.has(o.id)) return o;
                  return {
                      ...o,
                      items: o.items.map(item => item.catalogItem.type === ItemType.PRODUCT ? { ...item, status: ProductLogisticsStage.SHIPPED } : item)
                  };
              });
              break;
          case 'SET_SERVICES_READY':
                updatedOrders = updatedOrders.map(o => {
                    if (!selectedOrders.has(o.id)) return o;
                    return {
                        ...o,
                        items: o.items.map(item => item.catalogItem.type === ItemType.SERVICE ? { ...item, status: ServiceStage.READY } : item)
                    };
                });
                break;
      }
      setOrders(updatedOrders);
      setSelectedOrders(new Set()); // Clear selection
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
        alert("No orders to export.");
        return;
    }
    
    // Header
    const headers = ["Order ID", "Date", "Customer Name", "Phone", "Total Amount", "Payment Status", "Item Name", "Item Type", "Item Status", "Est. Delivery"];
    const rows = filteredOrders.flatMap(order => 
        order.items.map(item => [
            order.id,
            new Date(order.date).toLocaleDateString(),
            order.customerName || "N/A",
            order.customerPhone || "N/A",
            order.totalAmount,
            order.paymentStatus,
            item.catalogItem.name,
            item.catalogItem.type,
            item.status,
            item.estimatedDelivery || ""
        ])
    );

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (order: Order) => {
      alert(`Printing invoice for Order #${order.id}...\n(This would trigger the browser print dialog in a real app)`);
  };

  const filteredOrders = orders
    .filter(o => {
        const matchesStatus = orderFilterStatus === 'ALL' || o.paymentStatus === orderFilterStatus;
        const searchLower = orderSearch.toLowerCase();
        const matchesSearch = 
            o.customerName?.toLowerCase().includes(searchLower) || 
            o.customerPhone?.includes(searchLower) || 
            o.id.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return orderSort === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });

  // Detailed Status Helpers
  const getDetailedStatusDescription = (item: OrderItem) => {
      if (item.catalogItem.type === ItemType.SERVICE) {
          switch(item.status) {
              case ServiceStage.MEASUREMENTS_PENDING: return "Customer measurements received. Waiting for tailor assignment.";
              case ServiceStage.CUTTING: return "Fabric has been selected and patterns are being cut by the master tailor.";
              case ServiceStage.STITCHING: return "Garment is currently in the assembly phase on the sewing floor.";
              case ServiceStage.FITTING: return "Initial construction complete. Ready for customer fitting session.";
              case ServiceStage.READY: return "Final adjustments made. Garment is pressed and ready for collection.";
              case ServiceStage.COMPLETED: return "Order completed and handed over to customer.";
              default: return "Status unknown.";
          }
      } else {
          switch(item.status) {
              case ProductLogisticsStage.ORDER_PLACED: return "Order received in warehouse system. Inventory reserved.";
              case ProductLogisticsStage.PACKED: return "Item picked, quality checked, and packed in eco-friendly packaging.";
              case ProductLogisticsStage.SHIPPED: return "Package handed over to courier service (G4S/Wells Fargo). In transit.";
              case ProductLogisticsStage.DELIVERED: return "Package delivered to customer address.";
              default: return "Status unknown.";
          }
      }
  };

  // --------------------------------------------------------------------------------
  // CUSTOMER LOGIC
  // --------------------------------------------------------------------------------
  
  const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone?.includes(customerSearch) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getCustomerOrders = (userId: string) => {
      return orders.filter(o => o.userId === userId);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative text-slate-100">
      <div className="flex bg-slate-950 text-white">
        {/* Sidebar */}
        <div className="w-64 min-h-screen p-4 flex flex-col sticky top-0 h-screen overflow-y-auto border-r border-slate-800">
          <div className="mb-8 px-2 flex items-center gap-2">
            <i className="fas fa-shield-alt text-brand-400 text-xl"></i>
            <h2 className="text-xl font-serif font-bold">GIMCO Admin</h2>
          </div>
          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setActiveTab('OVERVIEW')} 
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'OVERVIEW' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-chart-line w-6 text-center"></i> Overview
            </button>
            <button 
              onClick={() => setActiveTab('ORDERS')} 
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'ORDERS' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-shopping-cart w-6 text-center"></i> Orders
            </button>
            <button 
              onClick={() => setActiveTab('INVENTORY')} 
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'INVENTORY' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-box-open w-6 text-center"></i> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('CUSTOMERS')} 
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'CUSTOMERS' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-users w-6 text-center"></i> Customers
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3 px-2">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-500 font-bold border border-slate-700">
                     KK
                 </div>
                 <div>
                     <p className="text-sm font-bold text-white">Kevin Kamau</p>
                     <p className="text-xs text-slate-500">Super Admin</p>
                 </div>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto max-h-screen">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Dashboard Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-bold uppercase">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">KES {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-bold uppercase">Total Orders</p>
                  <p className="text-3xl font-bold text-brand-600 mt-2">{totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-bold uppercase">Service Bookings</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{serviceOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-bold uppercase">Product Sales</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{productOrders}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-gray-800 text-lg">Weekly Revenue Trend</h4>
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">+12.5% vs last week</span>
                      </div>
                      <div className="flex items-end gap-2 sm:gap-4 h-64 w-full">
                         {chartData.map(d => (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                               <div 
                                 className="w-full bg-brand-200 rounded-t hover:bg-brand-500 transition-all duration-500 relative group cursor-pointer" 
                                 style={{ height: `${(d.value / maxChartVal) * 100}%` }}
                               >
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                   KES {d.value.toLocaleString()}
                                 </div>
                               </div>
                               <span className="text-xs text-gray-500 font-bold">{d.day}</span>
                            </div>
                         ))}
                      </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="font-bold text-gray-800 text-lg mb-6">Recent Activity</h4>
                      <div className="space-y-6">
                          {orders.slice(0, 5).map(order => (
                              <div key={order.id} className="flex gap-4 items-start">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${order.items[0]?.catalogItem.type === ItemType.SERVICE ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                      <i className={`fas ${order.items[0]?.catalogItem.type === ItemType.SERVICE ? 'fa-cut' : 'fa-box'}`}></i>
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-gray-800">New Order #{order.id}</p>
                                      <p className="text-xs text-gray-500 mt-1">{order.customerName} purchased {order.items.length} item(s)</p>
                                      <span className="text-xs text-brand-600 font-medium mt-1 block">{new Date(order.date).toLocaleDateString()}</span>
                                  </div>
                              </div>
                          ))}
                          <button onClick={() => setActiveTab('ORDERS')} className="w-full py-2 text-center text-sm font-bold text-brand-700 bg-brand-50 rounded hover:bg-brand-100 transition-colors">
                              View All Activity
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'ORDERS' && (
            <div>
              <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Order Management</h3>
                    <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors flex items-center gap-2">
                        <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700">
                        {/* Search Bar - Dark Mode */}
                        <div className="flex-1 w-full relative">
                             <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                             <input 
                                type="text" 
                                placeholder="Search by Customer Name or WhatsApp..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                             />
                        </div>

                        {/* Filters - Dark Mode */}
                        <select 
                            className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                            value={orderFilterStatus}
                            onChange={(e) => setOrderFilterStatus(e.target.value as PaymentStatus | 'ALL')}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={PaymentStatus.PAID}>Paid</option>
                            <option value={PaymentStatus.PENDING}>Pending</option>
                            <option value={PaymentStatus.FAILED}>Failed</option>
                        </select>
                        <select
                            className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                            value={orderSort}
                            onChange={(e) => setOrderSort(e.target.value as 'NEWEST' | 'OLDEST')}
                        >
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                  </div>

                  {/* Bulk Actions */}
                  {selectedOrders.size > 0 && (
                        <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 px-3 py-2 rounded animate-fade-in text-brand-100">
                            <span className="text-xs font-bold">{selectedOrders.size} Selected</span>
                            <div className="h-4 w-px bg-brand-700 mx-1"></div>
                            <button onClick={() => handleBulkAction('MARK_PAID')} className="text-xs text-green-400 hover:text-green-300 font-semibold">Mark Paid</button>
                            <button onClick={() => handleBulkAction('SET_PRODUCTS_SHIPPED')} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Ship Products</button>
                            <button onClick={() => handleBulkAction('SET_SERVICES_READY')} className="text-xs text-purple-400 hover:text-purple-300 font-semibold">Ready Services</button>
                        </div>
                  )}
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <p className="text-slate-500">No orders match the current filters.</p>
                ) : (
                    filteredOrders.map(order => (
                    <div key={order.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-colors ${selectedOrders.has(order.id) ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                                    checked={selectedOrders.has(order.id)}
                                    onChange={() => toggleOrderSelection(order.id)}
                                />
                                <div>
                                    <span className="font-bold text-lg text-gray-800">
                                        Order #{order.id} 
                                        <span className="text-sm font-normal text-gray-500 ml-2">({new Date(order.date).toLocaleDateString()})</span>
                                    </span>
                                    <div className="ml-3 mt-1">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.paymentStatus}
                                        </span>
                                        {order.customerName && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                <i className="fas fa-user mr-1"></i> {order.customerName}
                                                {order.customerPhone && <span className="ml-2"><i className="fas fa-phone mr-1"></i> {order.customerPhone}</span>}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <p className="font-bold text-brand-700">KES {order.totalAmount.toLocaleString()}</p>
                                <button 
                                  onClick={() => handlePrintInvoice(order)}
                                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                  <i className="fas fa-print"></i> Invoice
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 pl-9">
                            {order.items.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedDetailItem({ item, orderId: order.id })}
                                    className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${item.catalogItem.type === ItemType.SERVICE ? 'bg-brand-500' : 'bg-emerald-500'}`}></span>
                                        <span className="font-medium text-gray-800 group-hover:text-brand-700 transition-colors">{item.catalogItem.name}</span>
                                        <i className="fas fa-info-circle text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </div>
                                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-xs font-bold uppercase text-gray-600">Status:</span>
                                        <select 
                                            value={item.status} 
                                            onChange={(e) => updateOrderStatus(order.id, item.id, e.target.value)}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:ring-1 focus:ring-brand-500 outline-none font-medium"
                                        >
                                            {item.catalogItem.type === ItemType.SERVICE ? (
                                                Object.values(ServiceStage).map(s => <option key={s} value={s}>{s}</option>)
                                            ) : (
                                                Object.values(ProductLogisticsStage).map(s => <option key={s} value={s}>{s}</option>)
                                            )}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'INVENTORY' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-white">Inventory Management</h3>
                 <div className="flex bg-slate-800 rounded p-1 border border-slate-700">
                     <button 
                       onClick={() => setInventoryView('LIST')}
                       className={`px-3 py-1 text-sm rounded transition-colors ${inventoryView === 'LIST' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                     >
                       <i className="fas fa-list mr-2"></i> List
                     </button>
                     <button 
                       onClick={() => setInventoryView('GRID')}
                       className={`px-3 py-1 text-sm rounded transition-colors ${inventoryView === 'GRID' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                     >
                       <i className="fas fa-th mr-2"></i> Grid
                     </button>
                 </div>
              </div>
              
              {/* Add/Edit Item Form */}
              <div id="inventory-form" className={`bg-white p-6 rounded-xl shadow-sm border-2 ${editingItem ? 'border-brand-300' : 'border-gray-200'} mb-8 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-gray-900">
                        {editingItem ? `Edit Item: ${editingItem.name}` : 'Add New Item'}
                    </h4>
                    {editingItem && (
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 text-sm">
                            Cancel Edit
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Item Name</label>
                        <input 
                            type="text" placeholder="e.g., Bespoke Suit" className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none text-gray-900" required
                            value={itemForm.name || ''} onChange={e => setItemForm({...itemForm, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Price (KES)</label>
                        <input 
                            type="number" placeholder="0" className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none text-gray-900" required
                            value={itemForm.price || ''} onChange={e => setItemForm({...itemForm, price: parseFloat(e.target.value)})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Type</label>
                        <select 
                            className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                            value={itemForm.type} onChange={e => setItemForm({...itemForm, type: e.target.value as ItemType})}
                        >
                            <option value={ItemType.PRODUCT}>Physical Product</option>
                            <option value={ItemType.SERVICE}>Custom Service</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Category</label>
                        <select 
                            className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                            value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value as ItemCategory})}
                        >
                            <option value="MEN">Men</option>
                            <option value="WOMEN">Women</option>
                            <option value="ACCESSORIES">Accessories</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Image Source</label>
                        <div className="flex flex-col gap-3">
                            {/* URL Input */}
                            <input 
                                type="text" placeholder="Image URL (https://...)" 
                                className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                                value={itemForm.image?.startsWith('data:') ? '' : itemForm.image || ''} 
                                onChange={e => setItemForm({...itemForm, image: e.target.value})}
                            />
                            
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                            </div>

                            <div className="flex gap-4 items-center">
                                {/* File Upload */}
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer transition-colors text-sm font-medium">
                                    <i className="fas fa-upload"></i> Upload from Computer
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>

                                {/* AI Generation */}
                                <button 
                                    type="button"
                                    onClick={handleGenerateAIImage}
                                    disabled={isGeneratingImage || !itemForm.name || isSaving}
                                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                                        isGeneratingImage || !itemForm.name || isSaving
                                        ? 'bg-purple-100 text-purple-300 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                                    }`}
                                >
                                    {isGeneratingImage ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                                    Generate with AI
                                </button>
                            </div>

                            {/* Preview */}
                            {itemForm.image && (
                                <div className="mt-2 relative w-32 h-32 group">
                                    <img src={itemForm.image} alt="Preview" className="w-full h-full rounded object-cover border border-gray-300 shadow-sm" />
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setItemForm({...itemForm, image: ''});
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Description</label>
                        <input 
                            type="text" placeholder="Description of the item..." className="border w-full p-2 rounded focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                            value={itemForm.description || ''} onChange={e => setItemForm({...itemForm, description: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={isSaving} className="md:col-span-2 bg-brand-800 text-white py-2 rounded hover:bg-brand-900 font-bold transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSaving && <i className="fas fa-spinner fa-spin"></i>}
                        {isSaving ? 'Processing...' : (editingItem ? 'Update Item' : 'Add Item')}
                    </button>
                </form>
              </div>

              {/* Filters for Inventory List - Dark Mode */}
              <div className="flex flex-wrap gap-4 mb-6 items-center bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700">
                  <div className="flex-1 min-w-[200px] relative">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input 
                          type="text" 
                          placeholder="Search inventory..." 
                          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                      />
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">Type:</span>
                      <select 
                          className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                          value={inventoryFilterType}
                          onChange={(e) => setInventoryFilterType(e.target.value as ItemType | 'ALL')}
                      >
                          <option value="ALL">All Types</option>
                          <option value={ItemType.PRODUCT}>Products</option>
                          <option value={ItemType.SERVICE}>Services</option>
                      </select>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">Category:</span>
                      <select 
                          className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                          value={inventoryFilterCategory}
                          onChange={(e) => setInventoryFilterCategory(e.target.value as ItemCategory | 'ALL')}
                      >
                          <option value="ALL">All Categories</option>
                          <option value="MEN">Men</option>
                          <option value="WOMEN">Women</option>
                          <option value="ACCESSORIES">Accessories</option>
                      </select>
                  </div>
              </div>

              {/* Item List */}
              <div className={`grid gap-4 ${inventoryView === 'LIST' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                 {filteredInventory.map(item => (
                     <div key={item.id} className={`flex ${inventoryView === 'LIST' ? 'flex-row gap-4 p-4' : 'flex-col gap-2 p-3'} bg-white border rounded-lg shadow-sm hover:shadow-md transition-all group ${editingItem?.id === item.id ? 'border-brand-500 ring-2 ring-brand-100 bg-brand-50' : 'border-gray-200'}`}>
                         <div className={`relative ${inventoryView === 'LIST' ? 'w-24 h-24' : 'w-full aspect-square'}`}>
                            <img src={item.image} className="w-full h-full object-cover rounded bg-gray-100" alt={item.name} />
                         </div>
                         <div className="flex-1 flex flex-col justify-between">
                             <div>
                                <h4 className={`font-bold text-gray-800 ${inventoryView === 'GRID' && 'text-sm truncate'}`}>{item.name}</h4>
                                <p className="text-sm text-gray-500">KES {item.price.toLocaleString()} {inventoryView === 'LIST' && `• ${item.type}`}</p>
                                {inventoryView === 'LIST' && <p className="text-xs font-bold text-brand-600 mt-0.5">{item.category}</p>}
                                {inventoryView === 'LIST' && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>}
                             </div>
                             
                             <div className={`flex gap-2 mt-3 ${inventoryView === 'GRID' && 'justify-between'}`}>
                                <button 
                                    onClick={() => handleEditClick(item)}
                                    className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded hover:bg-brand-100 border border-brand-200 uppercase flex items-center gap-1 transition-colors"
                                >
                                    <i className="fas fa-edit"></i> {inventoryView === 'LIST' && 'Edit'}
                                </button>
                                <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-500 text-xs font-bold hover:text-red-700 uppercase flex items-center gap-1 ml-2"
                                >
                                    <i className="fas fa-trash"></i> {inventoryView === 'LIST' && 'Remove'}
                                </button>
                                {inventoryView === 'LIST' && (
                                    <button
                                        onClick={() => setShowingHistoryId(showingHistoryId === item.id ? null : item.id)}
                                        className="text-gray-500 text-xs font-bold hover:text-gray-800 uppercase flex items-center gap-1 ml-auto"
                                    >
                                        <i className="fas fa-history"></i> History
                                    </button>
                                )}
                             </div>
                         </div>
                         {showingHistoryId === item.id && inventoryView === 'LIST' && (
                             <div className="bg-gray-50 p-3 rounded text-xs border border-gray-200 mt-2 animate-fade-in w-full col-span-full">
                                 <h6 className="font-bold text-gray-600 mb-2 uppercase">Change Log</h6>
                                 {item.history && item.history.length > 0 ? (
                                     <ul className="space-y-2">
                                         {item.history.map((h, i) => (
                                             <li key={i} className="flex justify-between border-b border-gray-200 pb-1 last:border-0">
                                                 <span className="text-gray-700">{h.change}</span>
                                                 <span className="text-gray-400 text-xxs font-mono">{new Date(h.date).toLocaleDateString()}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 ) : (
                                     <p className="text-gray-400 italic">No history available.</p>
                                 )}
                             </div>
                         )}
                     </div>
                 ))}
                 {filteredInventory.length === 0 && (
                     <p className="col-span-full text-center text-slate-500 py-8">No items match your search filters.</p>
                 )}
              </div>
            </div>
          )}
          
          {activeTab === 'CUSTOMERS' && (
            <div>
               <h3 className="text-2xl font-bold text-white mb-6">Customer Management</h3>
               
               <div className="mb-6 bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search customers by Name, Email, or Phone..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCustomers.map(customer => (
                      <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                              <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xl uppercase border border-brand-200">
                                      {customer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-900 text-lg">{customer.name}</h4>
                                      <p className="text-xs text-gray-500 font-mono">{customer.id}</p>
                                  </div>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600 mb-6">
                                  <div className="flex items-center gap-2">
                                      <i className="fas fa-envelope w-5 text-gray-400"></i>
                                      <span>{customer.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <i className="fas fa-phone w-5 text-gray-400"></i>
                                      <span>{customer.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <i className="fas fa-shopping-bag w-5 text-gray-400"></i>
                                      <span>{getCustomerOrders(customer.id).length} Orders</span>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setSelectedCustomer(customer)}
                                  className="w-full py-2 border border-brand-200 text-brand-700 font-bold rounded hover:bg-brand-50 transition-colors"
                              >
                                  View Profile
                              </button>
                          </div>
                      </div>
                  ))}
                  {filteredCustomers.length === 0 && (
                      <p className="col-span-3 text-center text-slate-500 py-8">No customers found.</p>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Status Modal */}
      {selectedDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in text-gray-800">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                  <div className="bg-brand-900 px-6 py-4 flex justify-between items-center text-white">
                      <h4 className="font-bold font-serif text-lg">Tracking Breakdown</h4>
                      <button onClick={() => setSelectedDetailItem(null)} className="hover:text-brand-200"><i className="fas fa-times"></i></button>
                  </div>
                  <div className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                          <img src={selectedDetailItem.item.catalogItem.image} className="w-20 h-20 rounded object-cover bg-gray-100" alt="Item" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Order #{selectedDetailItem.orderId}</p>
                              <h5 className="font-bold text-gray-900 text-lg">{selectedDetailItem.item.catalogItem.name}</h5>
                              <p className="text-brand-600 font-medium text-sm mt-1">{selectedDetailItem.item.status}</p>
                          </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                          <h6 className="text-xs font-bold text-gray-400 uppercase mb-3">Detailed Status Report</h6>
                          <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5"></div>
                                  <div className="w-0.5 flex-1 bg-brand-200 my-1"></div>
                              </div>
                              <p className="text-gray-700 leading-relaxed text-sm">
                                  {getDetailedStatusDescription(selectedDetailItem.item)}
                              </p>
                          </div>
                          
                          {selectedDetailItem.item.catalogItem.type === ItemType.SERVICE && selectedDetailItem.item.customMeasurements && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h6 className="text-xs font-bold text-gray-400 uppercase mb-2">Applied Measurements</h6>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                      <span>Chest: {selectedDetailItem.item.customMeasurements.chest}"</span>
                                      <span>Waist: {selectedDetailItem.item.customMeasurements.waist}"</span>
                                  </div>
                              </div>
                          )}

                          {selectedDetailItem.item.catalogItem.type === ItemType.PRODUCT && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h6 className="text-xs font-bold text-gray-400 uppercase mb-2">Estimated Delivery</h6>
                                  <div className="flex items-center gap-2">
                                     <i className="fas fa-calendar-alt text-gray-400"></i>
                                     <input 
                                        type="date"
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-brand-500"
                                        value={selectedDetailItem.item.estimatedDelivery || ''}
                                        onChange={(e) => updateEstimatedDelivery(selectedDetailItem.orderId, selectedDetailItem.item.id, e.target.value)}
                                     />
                                  </div>
                              </div>
                          )}
                      </div>

                      <button 
                          onClick={() => setSelectedDetailItem(null)}
                          className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in text-gray-800">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                   <div className="bg-slate-900 px-6 py-6 flex justify-between items-start text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-2xl uppercase border-2 border-brand-400">
                                {selectedCustomer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-2xl">{selectedCustomer.name}</h3>
                                <div className="flex items-center gap-2 text-brand-200 text-sm mt-1">
                                    <span>{selectedCustomer.email}</span>
                                    <span>•</span>
                                    <span>Lifetime Value: KES {getCustomerOrders(selectedCustomer.id).reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white transition-colors">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                   </div>
                   
                   <div className="p-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <h5 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                                    <i className="fas fa-ruler-combined text-brand-600"></i> Measurements
                                </h5>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    {Object.entries(selectedCustomer.measurements).map(([key, val]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-xs font-bold uppercase text-gray-400">{key}</span>
                                            <span className="font-mono text-gray-800 font-medium">{val}"</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <h5 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                                    <i className="fas fa-address-card text-brand-600"></i> Contact Info
                                </h5>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-400">Phone</p>
                                        <p className="text-gray-800">{selectedCustomer.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-400">Email</p>
                                        <p className="text-gray-800">{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-400">Customer ID</p>
                                        <p className="text-gray-500 font-mono text-xs">{selectedCustomer.id}</p>
                                    </div>
                                </div>
                            </div>
                       </div>

                       <div>
                           <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i className="fas fa-history text-brand-600"></i> Order History
                           </h5>
                           {getCustomerOrders(selectedCustomer.id).length > 0 ? (
                               <div className="space-y-4">
                                   {getCustomerOrders(selectedCustomer.id).map(order => (
                                       <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                           <div className="flex justify-between items-center mb-2">
                                               <span className="font-bold text-gray-700">Order #{order.id}</span>
                                               <span className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                                           </div>
                                           <div className="flex justify-between items-center">
                                               <span className="text-sm text-gray-600">{order.items.length} Items</span>
                                               <span className="font-bold text-brand-700">KES {order.totalAmount.toLocaleString()}</span>
                                           </div>
                                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                {order.items.map(item => (
                                                    <span key={item.id} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                                                        {item.catalogItem.name}
                                                    </span>
                                                ))}
                                            </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded">No orders found for this customer.</p>
                           )}
                       </div>
                   </div>
                   <div className="bg-gray-100 px-6 py-4 flex justify-end">
                       <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2 bg-gray-900 text-white rounded font-bold hover:bg-gray-800">Close</button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};