import React from 'react';

const MealCard = ({ image, mealType, date, itemsCount, status, onClick }) => {
  const getStatusBadge = () => {
    if (status === 'closed') {
      return (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-gray-700">Window Closed</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
    >
      <div className="relative h-48 bg-gray-100">
        {image ? (
          <img src={image} alt={mealType} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {getStatusBadge()}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 capitalize">{mealType}</h3>
        <p className="text-sm text-gray-500 mb-3">{date}</p>
        <p className="text-sm text-gray-600">{itemsCount} items available</p>
      </div>
    </div>
  );
};

export default MealCard;
