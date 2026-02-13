
import React from 'react';
import { CategoryType } from '../types';

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onSelect: (category: CategoryType) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onSelect }) => {
  const categories = [
    { type: CategoryType.FLIGHTS, label: 'Live Flights', icon: 'fa-plane-departure' },
    { type: CategoryType.SERVICES, label: 'Services', icon: 'fa-concierge-bell' },
    { type: CategoryType.GAS, label: 'Gas/Fuel', icon: 'fa-gas-pump' },
    { type: CategoryType.RESTAURANTS, label: 'Restaurants', icon: 'fa-utensils' },
    { type: CategoryType.RENTALS, label: 'Rental Cars', icon: 'fa-car' },
    { type: CategoryType.REVIEWS, label: 'Reviews', icon: 'fa-star' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => (
        <button
          key={cat.type}
          onClick={() => onSelect(cat.type)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
            activeCategory === cat.type
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <i className={`fas ${cat.icon}`}></i>
          <span className="font-semibold">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
