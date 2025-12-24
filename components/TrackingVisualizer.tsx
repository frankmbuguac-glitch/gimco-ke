import React from 'react';
import { ItemType, ServiceStage, ProductLogisticsStage } from '../types';

interface TrackingVisualizerProps {
  type: ItemType;
  status: string;
}

export const TrackingVisualizer: React.FC<TrackingVisualizerProps> = ({ type, status }) => {
  
  const getServiceSteps = () => [
    { key: ServiceStage.MEASUREMENTS_PENDING, label: 'Measured', icon: 'fa-ruler-combined' },
    { key: ServiceStage.CUTTING, label: 'Cutting', icon: 'fa-scissors' },
    { key: ServiceStage.STITCHING, label: 'Stitching', icon: 'fa-vector-square' }, // using generic for sewing machine implication
    { key: ServiceStage.FITTING, label: 'Fitting', icon: 'fa-user-tie' },
    { key: ServiceStage.READY, label: 'Ready', icon: 'fa-check-circle' }
  ];

  const getProductSteps = () => [
    { key: ProductLogisticsStage.ORDER_PLACED, label: 'Placed', icon: 'fa-file-invoice' },
    { key: ProductLogisticsStage.PACKED, label: 'Packed', icon: 'fa-box-open' },
    { key: ProductLogisticsStage.SHIPPED, label: 'Shipped', icon: 'fa-truck' },
    { key: ProductLogisticsStage.DELIVERED, label: 'Delivered', icon: 'fa-home' }
  ];

  const steps = type === ItemType.SERVICE ? getServiceSteps() : getProductSteps();
  
  // Helper to determine active index
  const activeIndex = steps.findIndex(s => s.key === status);
  // If status is 'COMPLETED' (for service) treat as last step
  const finalIndex = status === 'COMPLETED' ? steps.length - 1 : activeIndex;

  const isCompleted = (index: number) => index <= finalIndex;
  const isCurrent = (index: number) => index === finalIndex;

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between relative z-10">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted(index) 
                  ? (type === ItemType.SERVICE ? 'bg-brand-600 border-brand-600 text-white' : 'bg-emerald-600 border-emerald-600 text-white') 
                  : 'bg-white border-gray-300 text-gray-300'
                }
                ${isCurrent(index) ? 'ring-4 ring-opacity-30 ring-brand-300 scale-110' : ''}
              `}
            >
              <i className={`fas ${step.icon} text-sm`}></i>
            </div>
            <span className={`text-xs mt-2 font-medium ${isCompleted(index) ? 'text-gray-800' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
        
        {/* Connecting Line - Background */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
        
        {/* Connecting Line - Active */}
        <div 
          className={`absolute top-5 left-0 h-1 transition-all duration-500 -z-10 rounded ${type === ItemType.SERVICE ? 'bg-brand-600' : 'bg-emerald-600'}`}
          style={{ width: `${(finalIndex / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};