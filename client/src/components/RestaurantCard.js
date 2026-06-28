import Image from 'next/image';
import Link from 'next/link';

export default function RestaurantCard({ restaurant }) {
  // Safe defaults if data is missing
  const {
    slug = '',
    name = 'Restaurant',
    coverImage = null,
    avgRating = 0,
    cuisines = [],
    priceRange = 2,
    deliveryRadius = 0,
    address = {}
  } = restaurant;

  const priceIndicator = '₹'.repeat(priceRange) + ' '.repeat(4 - priceRange);
  
  return (
    <Link href={`/restaurant/${slug}`} className="card" style={{ display: 'block' }}>
      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
        <Image 
          src={coverImage?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"} 
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
        />
        {/* Promoted / Offer Badge */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '0',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px'
        }}>
          50% OFF
        </div>
      </div>
      
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-1)' }}>
          <h3 className="text-h4 font-bold truncate" style={{ maxWidth: '75%' }}>{name}</h3>
          <div style={{ 
            backgroundColor: 'var(--color-rating-good)', 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {avgRating.toFixed(1)} <span style={{ fontSize: '10px' }}>★</span>
          </div>
        </div>
        
        <div className="flex justify-between text-muted text-small" style={{ marginBottom: 'var(--space-2)' }}>
          <p className="truncate" style={{ maxWidth: '60%' }}>{cuisines.join(', ')}</p>
          <p>{priceIndicator}</p>
        </div>
        
        <div className="flex items-center text-small text-muted" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
          <span style={{ marginRight: '8px' }}>🛵</span>
          <span>{deliveryRadius} km • {address.city || 'Bengaluru'}</span>
        </div>
      </div>
    </Link>
  );
}
