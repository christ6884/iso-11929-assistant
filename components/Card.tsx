import React from 'react';

interface CardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-800/70 rounded-lg shadow-xl mb-6 backdrop-blur-md border border-gray-700 ${className}`}>
      <h2 className="text-lg font-semibold text-cyan-400 bg-gray-900/50 px-6 py-3 rounded-t-lg border-b border-gray-700">
        {title}
      </h2>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
