import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, transform: '' });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = 320; // Corresponds to w-80
      const spacing = 8;

      // --- Horizontal positioning ---
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      // Adjust for screen edges
      if (left < spacing) {
        left = spacing;
      } else if (left + tooltipWidth > window.innerWidth - spacing) {
        left = window.innerWidth - tooltipWidth - spacing;
      }

      // --- Vertical positioning (flipping logic) ---
      let top: number;
      let transform: string;

      // If icon is in the top half of the screen, display tooltip below it.
      if (rect.top < window.innerHeight / 2) {
        top = rect.bottom + spacing;
        transform = 'translateY(0)';
      } else { // Otherwise, display tooltip above it.
        top = rect.top - spacing;
        transform = 'translateY(-100%)';
      }

      setPosition({ top, left, transform });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={iconRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500 hover:text-cyan-400 cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      {isVisible &&
        createPortal(
          <div
            className="fixed w-80 bg-gray-900 text-white text-xs rounded py-2 px-3 transition-opacity duration-300 pointer-events-none border border-cyan-500 shadow-lg z-50 whitespace-pre-wrap"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: position.transform,
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export default InfoTooltip;