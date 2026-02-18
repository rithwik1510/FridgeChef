'use client';

import React, { useState, useRef } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  valueLabel?: (value: number) => string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  valueLabel,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percent = ((value - min) / (max - min)) * 100;

  const handleInteraction = (clientX: number) => {
    if (disabled || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    onChange(clampedValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleInteraction(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      {label && (
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-semibold text-terracotta">
            {valueLabel ? valueLabel(value) : value}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        className="relative h-12 flex items-center cursor-pointer touch-pan-x select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-2 bg-cream-darker rounded-full" />

        {/* Filled portion */}
        <div
          className="absolute left-0 h-2 bg-terracotta rounded-full"
          style={{ width: `${percent}%` }}
        />

        {/* Thumb */}
        <div
          className={`absolute w-6 h-6 bg-terracotta rounded-full shadow-medium
                      transform -translate-x-1/2 transition-transform duration-75
                      ${isDragging ? 'scale-125' : 'hover:scale-110'}`}
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
};
