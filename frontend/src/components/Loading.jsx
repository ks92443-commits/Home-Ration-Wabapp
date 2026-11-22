import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <ShoppingCart className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;