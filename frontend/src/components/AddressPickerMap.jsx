import React, { useRef, useEffect, useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';

const AddressPickerMap = ({ onAddressSelect, defaultAddress }) => {
  const canvasRef = useRef(null);
  const [pin, setPin] = useState({ x: 200, y: 120 }); // Default pin coordinate
  const [addressDetails, setAddressDetails] = useState('');

  // Map coordinates to simulated Jaipur address zones
  const getSimulatedAddress = (x, y) => {
    if (x < 150 && y < 100) {
      return `C-Scheme Central, Near Central Park, Jaipur (Coordinates: [${x}, ${y}])`;
    } else if (x >= 150 && x < 300 && y < 100) {
      return `Raja Park Lane 4, Vaishali Nagar, Jaipur (Coordinates: [${x}, ${y}])`;
    } else if (x >= 300 && y < 100) {
      return `Malviya Nagar Sector 3, Near GT, Jaipur (Coordinates: [${x}, ${y}])`;
    } else if (x < 150 && y >= 100) {
      return `Mansarovar Sector 7, Near Metro Station, Jaipur (Coordinates: [${x}, ${y}])`;
    } else if (x >= 150 && x < 300 && y >= 100) {
      return `Civil Lines VIP Block, Near Raj Mandir, Jaipur (Coordinates: [${x}, ${y}])`;
    } else {
      return `Tonk Road Block B, Near Airport Enclave, Jaipur (Coordinates: [${x}, ${y}])`;
    }
  };

  useEffect(() => {
    // Generate initial address based on default pin
    const initialAddr = getSimulatedAddress(pin.x, pin.y);
    setAddressDetails(initialAddr);
  }, []);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    const newPin = { x, y };
    setPin(newPin);
    
    const addressStr = getSimulatedAddress(x, y);
    setAddressDetails(addressStr);
    
    // Trigger parent callback
    if (onAddressSelect) {
      onAddressSelect(addressStr);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animFrame;
    let pulseSize = 0;

    const drawMapGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulseSize = (pulseSize + 0.15) % 15;

      // 1. Draw grid backdrop (simulation of streets)
      ctx.fillStyle = '#161622';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // 2. Draw mock street layouts
      ctx.strokeStyle = 'rgba(255, 94, 58, 0.1)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Verticals
      ctx.moveTo(100, 0); ctx.lineTo(100, canvas.height);
      ctx.moveTo(250, 0); ctx.lineTo(250, canvas.height);
      ctx.moveTo(380, 0); ctx.lineTo(380, canvas.height);
      // Horizontals
      ctx.moveTo(0, 80); ctx.lineTo(canvas.width, 80);
      ctx.moveTo(0, 160); ctx.lineTo(canvas.width, 160);
      ctx.stroke();

      // Label sectors
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillText('C-Scheme', 25, 45);
      ctx.fillText('Vaishali Nagar', 160, 45);
      ctx.fillText('Malviya Nagar', 310, 45);
      ctx.fillText('Mansarovar', 25, 125);
      ctx.fillText('Civil Lines', 170, 125);
      ctx.fillText('Tonk Road', 320, 125);

      // 3. Draw pulsing selector ring
      ctx.strokeStyle = 'rgba(255, 94, 58, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 6 + pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Pin core circle
      ctx.fillStyle = 'var(--primary)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label pin
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('Deliver Here', pin.x - 30, pin.y - 12);

      animFrame = requestAnimationFrame(drawMapGrid);
    };

    animFrame = requestAnimationFrame(drawMapGrid);
    return () => cancelAnimationFrame(animFrame);
  }, [pin]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border)' }}>
        {/* Helper Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(25, 25, 35, 0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <MapPin size={10} style={{ color: 'var(--primary)' }} />
          <span>Click on map to pin address</span>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onClick={handleCanvasClick}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            cursor: 'crosshair'
          }}
        />
      </div>

      {addressDetails && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          backgroundColor: 'var(--bg-app)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--primary)' }}>Pinned Location:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{addressDetails}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPickerMap;
