'use client';
import { useState, useEffect } from 'react';
import useCartStore from '@/store/useCartStore';
import Link from 'next/link';

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we only render on client to avoid hydration mismatch with localStorage state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mocking cart data for UI since backend isn't connected to DB
  const mockCart = {
    restaurant: { name: 'Truffles', slug: 'truffles', minimumOrder: 150, deliveryFee: 40 },
    items: [
      { _id: '1', name: 'All American Cheese Burger', price: 250, quantity: 2, itemTotal: 500, isVeg: false },
      { _id: '2', name: 'Peri Peri Fries', price: 150, quantity: 1, itemTotal: 150, isVeg: true },
    ],
    totalAmount: 650,
    totalItems: 3
  };

  const cart = mockCart; // useCartStore(state => state.cart);

  if (!isClient) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container flex-col items-center justify-center" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🛒</div>
        <h2 className="text-h2 font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted mb-6">You can go to home page to view more restaurants</p>
        <Link href="/" className="btn btn-primary">See Restaurants near you</Link>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const platformFee = 5;
  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = cart.restaurant.deliveryFee;
  const grandTotal = subtotal + platformFee + gst + deliveryFee;

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
      <h1 className="text-h2 font-bold mb-6">Secure Checkout</h1>
      
      <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: 'var(--space-8)' }}>
        {/* Left Side - Details */}
        <div className="flex-col gap-6">
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="text-h3 font-bold mb-4">Account</h3>
            <p className="text-muted">You are securely logged in.</p>
          </div>
          
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="text-h3 font-bold mb-4">Delivery Address</h3>
            <div style={{ border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold mb-1">Home</p>
                  <p className="text-muted text-small">123, 5th Main, Koramangala, Bengaluru, Karnataka 560034</p>
                </div>
                <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>✓</span>
              </div>
            </div>
            <button className="text-primary font-bold mt-4">+ Add new address</button>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="text-h3 font-bold mb-4">Payment Method</h3>
            <label className="flex items-center gap-3 cursor-pointer" style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <input type="radio" name="payment" defaultChecked />
              <span className="font-medium">Online Payment (Razorpay)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer mt-4" style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <input type="radio" name="payment" />
              <span className="font-medium">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Right Side - Cart Summary */}
        <div>
          <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: '20px' }}>
            <div className="flex items-center gap-4 mb-6">
              <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-sm)' }}></div>
              <div>
                <h4 className="text-h4 font-bold">{cart.restaurant.name}</h4>
                <p className="text-muted text-small">{cart.restaurant.slug}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--color-border)', margin: 'var(--space-4) 0' }}></div>

            <div className="flex-col gap-4 mb-6">
              {cart.items.map(item => (
                <div key={item._id} className="flex justify-between items-center text-small">
                  <div className="flex items-center gap-2">
                    <span style={{ color: item.isVeg ? 'var(--color-success)' : 'var(--color-error)' }}>●</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div style={{ border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-primary)', display: 'flex', gap: '8px' }}>
                      <span className="cursor-pointer">-</span>
                      <span>{item.quantity}</span>
                      <span className="cursor-pointer">+</span>
                    </div>
                    <span className="font-medium" style={{ width: '60px', textAlign: 'right' }}>₹{item.itemTotal}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }}></div>

            <div className="flex-col gap-2 text-small">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }}></div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-h4 font-bold">To Pay</span>
              <span className="text-h4 font-bold">₹{grandTotal}</span>
            </div>

            <button className="btn btn-primary w-full" style={{ padding: 'var(--space-3)' }}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
