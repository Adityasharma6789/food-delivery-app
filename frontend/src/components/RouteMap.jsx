import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const RouteMap = ({ status, restaurantName }) => {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Coordinate nodes
  const nodes = {
    restaurant: { x: 70, y: 220, label: restaurantName || 'Restaurant' },
    user: { x: 410, y: 70, label: 'Delivery Location' }
  };

  // Route path segment coordinates (connecting with a turn)
  const route = [
    { x: 70, y: 220 },   // Start: Restaurant
    { x: 230, y: 220 },  // Midpoint 1
    { x: 230, y: 70 },   // Midpoint 2
    { x: 410, y: 70 }    // End: Home
  ];

  // Set progress based on status
  useEffect(() => {
    if (status === 'Placed') {
      setProgress(0);
    } else if (status === 'Preparing') {
      setProgress(0.05); // Just starting prep
    } else if (status === 'Delivered') {
      setProgress(1.0); // Arrived
    }
  }, [status]);

  // If Out for Delivery, animate the progress continuously to simulate driving
  useEffect(() => {
    if (status !== 'Out for Delivery') return;

    let animFrame;
    let startTime = Date.now();
    const cycleDuration = 12000; // 12 seconds to complete the loop

    const updateAnim = () => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const currentProgress = elapsed / cycleDuration;
      setProgress(0.05 + currentProgress * 0.9); // Drive between 5% and 95%
      animFrame = requestAnimationFrame(updateAnim);
    };

    animFrame = requestAnimationFrame(updateAnim);
    return () => cancelAnimationFrame(animFrame);
  }, [status]);

  // Helper to interpolate along the path
  const getPositionAlongPath = (t) => {
    // Clamp t
    t = Math.max(0, Math.min(1, t));
    
    // There are 3 segments in the route
    const segmentsCount = route.length - 1;
    const segmentIndex = Math.floor(t * segmentsCount);
    
    if (segmentIndex >= segmentsCount) {
      return route[route.length - 1];
    }
    
    const segmentProgress = (t * segmentsCount) - segmentIndex;
    const start = route[segmentIndex];
    const end = route[segmentIndex + 1];
    
    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrame;
    let pulseAngle = 0;

    const drawMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulseAngle += 0.05;

      // 1. Draw grid / grass blocks background
      ctx.fillStyle = 'rgba(255, 94, 58, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // 2. Draw mock city blocks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1.5;
      
      // Drawing some mock building shapes
      const blocks = [
        { x: 20, y: 20, w: 100, h: 60 },
        { x: 140, y: 20, w: 60, h: 160 },
        { x: 20, y: 100, w: 100, h: 80 },
        { x: 260, y: 100, w: 110, h: 100 },
        { x: 390, y: 110, w: 70, h: 110 },
        { x: 260, y: 20, w: 110, h: 50 }
      ];
      blocks.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });

      // 3. Draw Roads (Street paths)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      route.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Road center dashed line
      ctx.strokeStyle = 'rgba(255, 94, 58, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      route.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 4. Draw Route line tracker (highlight completed path)
      const riderPos = getPositionAlongPath(progress);
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(route[0].x, route[0].y);
      
      // Draw path up to progress
      const segmentsCount = route.length - 1;
      const activeSegIndex = Math.floor(progress * segmentsCount);
      for (let i = 1; i <= activeSegIndex; i++) {
        ctx.lineTo(route[i].x, route[i].y);
      }
      ctx.lineTo(riderPos.x, riderPos.y);
      ctx.stroke();

      // 5. Draw Restaurant Node
      const rPulse = 10 + Math.sin(pulseAngle) * 3;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Yellow pulse
      ctx.beginPath();
      ctx.arc(nodes.restaurant.x, nodes.restaurant.y, rPulse, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(nodes.restaurant.x, nodes.restaurant.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw User Node (Home)
      const uPulse = 10 + Math.sin(pulseAngle + 1) * 3;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // Blue pulse
      ctx.beginPath();
      ctx.arc(nodes.user.x, nodes.user.y, uPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(nodes.user.x, nodes.user.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(nodes.restaurant.label, nodes.restaurant.x - 45, nodes.restaurant.y - 15);
      ctx.fillText(nodes.user.label, nodes.user.x - 50, nodes.user.y - 15);

      // 7. Draw Rider Scooter Icon
      ctx.save();
      ctx.translate(riderPos.x, riderPos.y);
      
      // Pulsing outer shadow for rider
      const riderPulse = 12 + Math.sin(pulseAngle * 2) * 4;
      ctx.fillStyle = 'rgba(255, 94, 58, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, riderPulse, 0, Math.PI * 2);
      ctx.fill();

      // Core scooter circle
      ctx.fillStyle = 'var(--primary)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw a tiny directional arrow
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(3, 3);
      ctx.lineTo(-3, 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Label rider status details
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'var(--primary)';
      ctx.fillText(
        status === 'Delivered' ? 'Arrived!' : 'Swift Delivery Rider 🛵',
        riderPos.x - 50,
        riderPos.y + 20
      );

      animationFrame = requestAnimationFrame(drawMap);
    };

    animationFrame = requestAnimationFrame(drawMap);
    return () => cancelAnimationFrame(animationFrame);
  }, [progress, status]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border)', backgroundColor: '#13131a' }}>
      
      {/* HUD Info bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: 'rgba(20, 20, 28, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#fff',
        zIndex: 5
      }}>
        <Navigation size={12} style={{ color: 'var(--primary)' }} />
        <span>Rider Tracking:</span>
        <span style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{status}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={280}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default RouteMap;
