import Image from 'next/image';

export default function MenuItemCard({ item, onAdd }) {
  const {
    _id,
    name,
    price,
    description,
    image,
    isVeg,
    isBestseller
  } = item;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: 'var(--space-4) 0',
      borderBottom: '1px solid var(--color-border)'
    }}>
      <div style={{ flex: '1', paddingRight: 'var(--space-4)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
          <span style={{ 
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: `1px solid ${isVeg ? 'var(--color-success)' : 'var(--color-error)'}`,
            borderRadius: '2px',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              backgroundColor: isVeg ? 'var(--color-success)' : 'var(--color-error)',
              borderRadius: '50%'
            }}></span>
          </span>
          {isBestseller && <span style={{ color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 'bold' }}>★ Bestseller</span>}
        </div>
        
        <h4 className="text-h4 font-medium" style={{ marginBottom: 'var(--space-1)' }}>{name}</h4>
        <p className="font-medium" style={{ marginBottom: 'var(--space-2)' }}>₹{price}</p>
        <p className="text-muted text-small line-clamp-2">{description}</p>
      </div>

      <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
        <Image 
          src={image?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"} 
          alt={name}
          fill
          style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
        />
        <button 
          onClick={() => onAdd(item)}
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 24px',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-sm)',
            textTransform: 'uppercase',
            fontSize: '0.875rem'
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
