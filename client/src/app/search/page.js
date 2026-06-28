'use client';
import { useState, useEffect } from 'react';
import RestaurantCard from '@/components/RestaurantCard';
import api from '@/lib/api';

export default function SearchPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch from API
    // const fetchRestaurants = async () => {
    //   const res = await api.get('/search?q=');
    //   setRestaurants(res.data.restaurants);
    //   setIsLoading(false);
    // };
    // fetchRestaurants();
    
    // Using mock data for immediate visual feedback of the UI since DB is empty
    setTimeout(() => {
      setRestaurants([
        { _id: '1', name: 'Truffles', slug: 'truffles', avgRating: 4.5, cuisines: ['Burger', 'American', 'Desserts'], priceRange: 2, deliveryRadius: 5 },
        { _id: '2', name: 'Meghana Foods', slug: 'meghana-foods', avgRating: 4.8, cuisines: ['Biryani', 'Andhra', 'North Indian'], priceRange: 3, deliveryRadius: 8 },
        { _id: '3', name: 'Leon Grill', slug: 'leon-grill', avgRating: 4.2, cuisines: ['Turkish', 'Lebanese', 'Fast Food'], priceRange: 2, deliveryRadius: 4 },
        { _id: '4', name: 'Empire Restaurant', slug: 'empire', avgRating: 4.0, cuisines: ['North Indian', 'Mughlai', 'Kerala'], priceRange: 2, deliveryRadius: 10 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
      {/* Search Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="text-h2 font-bold mb-4">Delivery Restaurants in Bengaluru</h1>
        <div className="flex gap-4" style={{ marginTop: 'var(--space-4)' }}>
          <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>Filters</button>
          <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>Rating: 4.0+</button>
          <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>Pure Veg</button>
          <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>Cuisines ▾</button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ height: '300px', backgroundColor: 'var(--color-surface-sunken)', animation: 'pulse 2s infinite' }}></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {restaurants.map(rest => (
            <RestaurantCard key={rest._id} restaurant={rest} />
          ))}
        </div>
      )}
    </div>
  );
}
