import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ icon: Icon, title, description, onClick, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 group"
    >
      <div className="flex flex-col items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;
