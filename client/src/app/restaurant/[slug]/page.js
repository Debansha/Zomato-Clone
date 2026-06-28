'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import MenuItemCard from '@/components/MenuItemCard';
import useCartStore from '@/store/useCartStore';

export default function RestaurantPage({ params }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const addItem = useCartStore(state => state.addItem);

  // Note: params is a promise in Next.js 15, but for simplicity here we'll assume standard execution
  
  useEffect(() => {
    // Mock data fetching
    setTimeout(() => {
      setRestaurant({
        name: 'Truffles',
        avgRating: 4.5,
        totalReviews: 1250,
        cuisines: ['Burger', 'American', 'Desserts', 'Beverages'],
        address: { street: 'Koramangala 5th Block', city: 'Bengaluru' },
        operatingHours: { open: '11:00', close: '23:00' },
        coverImage: { url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop' }
      });

      setMenu([
        {
          _id: 'cat1',
          category: 'Recommended',
          items: [
            { _id: 'm1', name: 'All American Cheese Burger', price: 250, description: 'Classic beef patty with cheddar cheese, lettuce, tomato and our secret sauce.', isVeg: false, isBestseller: true },
            { _id: 'm2', name: 'Peri Peri Fries', price: 150, description: 'Crispy french fries tossed in spicy peri peri seasoning.', isVeg: true, isBestseller: true },
          ]
        },
        {
          _id: 'cat2',
          category: 'Main Course',
          items: [
            { _id: 'm3', name: 'Mac & Cheese', price: 300, description: 'Creamy macaroni and cheese baked to perfection.', isVeg: true, isBestseller: false },
          ]
        }
      ]);
    }, 500);
  }, []);

  const handleAddToCart = (item) => {
    addItem(item._id, 1);
    alert(`Added ${item.name} to cart! (Store updated)`);
  };

  if (!restaurant) return <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: 'var(--space-4)' }}>
      {/* Breadcrumb */}
      <div className="text-small text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        Home / Bengaluru / Koramangala / {restaurant.name}
      </div>

      {/* Hero Image */}
      <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <Image src={restaurant.coverImage.url} alt={restaurant.name} fill style={{ objectFit: 'cover' }} />
      </div>

      {/* Info Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="text-h1 font-bold">{restaurant.name}</h1>
          <p className="text-h4 text-muted">{restaurant.cuisines.join(', ')}</p>
          <p className="text-muted">{restaurant.address.street}, {restaurant.address.city}</p>
          <p className="text-muted text-small mt-2"><span style={{ color: 'var(--color-primary)' }}>Open now</span> - {restaurant.operatingHours.open} to {restaurant.operatingHours.close}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'var(--color-rating-good)', color: 'white', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div className="text-h4 font-bold">{restaurant.avgRating} ★</div>
            <div className="text-tiny">{restaurant.totalReviews} Delivery Reviews</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: 'var(--space-8)' }}></div>

      {/* Menu Section */}
      <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: 'var(--space-8)' }}>
        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
          <h3 className="text-h4 font-bold mb-4">Menu</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {menu.map(cat => (
              <li key={cat._id}>
                <a href={`#${cat.category}`} style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>{cat.category} ({cat.items.length})</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu Items */}
        <div>
          {menu.map(cat => (
            <div key={cat._id} id={cat.category} style={{ marginBottom: 'var(--space-8)' }}>
              <h2 className="text-h3 font-bold" style={{ marginBottom: 'var(--space-4)' }}>{cat.category}</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cat.items.map(item => (
                  <MenuItemCard key={item._id} item={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
