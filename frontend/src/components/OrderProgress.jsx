import React from 'react';
import { ShoppingBag, Flame, Bike, CheckCircle2 } from 'lucide-react';

const OrderProgress = ({ status }) => {
  const steps = [
    { label: 'Order Placed', statusKey: 'Placed', icon: ShoppingBag },
    { label: 'Preparing', statusKey: 'Preparing', icon: Flame },
    { label: 'Out for Delivery', statusKey: 'Out for Delivery', icon: Bike },
    { label: 'Delivered', statusKey: 'Delivered', icon: CheckCircle2 }
  ];

  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Placed': return 0;
      case 'Preparing': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const activeIndex = getStatusIndex(status);

  // Line width calculation
  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="progress-container">
        {/* Background Track Line */}
        <div className="progress-line">
          <div
            className="progress-line-active"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          
          let stepClass = '';
          if (isCompleted) stepClass = 'completed';
          else if (isActive) stepClass = 'active';

          return (
            <div key={idx} className={`progress-step ${stepClass}`}>
              <div className="progress-node">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <div className="progress-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;
