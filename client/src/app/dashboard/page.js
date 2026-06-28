'use client';
import { useState } from 'react';

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  const orders = [
    { _id: 'ORD-101', customerName: 'Rahul M.', items: '2x Cheese Burger, 1x Fries', total: 650, status: 'placed', time: '10:30 AM' },
    { _id: 'ORD-102', customerName: 'Priya S.', items: '1x Mac & Cheese', total: 300, status: 'preparing', time: '10:15 AM' },
    { _id: 'ORD-103', customerName: 'Amit V.', items: '1x Veggie Pizza', total: 450, status: 'ready', time: '10:00 AM' }
  ];

  const menuItems = [
    { _id: 'M1', name: 'Cheese Burger', price: 250, isAvailable: true },
    { _id: 'M2', name: 'Peri Fries', price: 150, isAvailable: true },
    { _id: 'M3', name: 'Mac & Cheese', price: 300, isAvailable: false },
  ];

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-h1 font-bold">Restaurant Partner Dashboard</h1>
        <div style={{ backgroundColor: 'var(--color-surface-sunken)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)' }}>
          <span style={{ color: 'var(--color-success)', marginRight: '8px' }}>●</span>
          <span className="font-medium">Accepting Orders</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`text-h4 font-medium ${activeTab === 'orders' ? 'text-primary' : 'text-muted'}`}
          style={{ borderBottom: activeTab === 'orders' ? '2px solid var(--color-primary)' : 'none' }}
        >
          Live Orders
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`text-h4 font-medium ${activeTab === 'menu' ? 'text-primary' : 'text-muted'}`}
          style={{ borderBottom: activeTab === 'menu' ? '2px solid var(--color-primary)' : 'none' }}
        >
          Menu Management
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`text-h4 font-medium ${activeTab === 'analytics' ? 'text-primary' : 'text-muted'}`}
          style={{ borderBottom: activeTab === 'analytics' ? '2px solid var(--color-primary)' : 'none' }}
        >
          Analytics
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-3 gap-6">
          {['placed', 'preparing', 'ready'].map(statusGroup => (
            <div key={statusGroup} style={{ backgroundColor: 'var(--color-surface-sunken)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', minHeight: '400px' }}>
              <h3 className="text-h4 font-bold mb-4" style={{ textTransform: 'uppercase' }}>
                {statusGroup} ({orders.filter(o => o.status === statusGroup).length})
              </h3>
              
              <div className="flex-col gap-4">
                {orders.filter(o => o.status === statusGroup).map(order => (
                  <div key={order._id} className="card" style={{ padding: 'var(--space-4)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{order._id}</span>
                      <span className="text-small text-muted">{order.time}</span>
                    </div>
                    <p className="font-medium mb-1">{order.customerName}</p>
                    <p className="text-small text-muted mb-4">{order.items}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">₹{order.total}</span>
                      {statusGroup === 'placed' && <button className="btn btn-primary text-small">Accept</button>}
                      {statusGroup === 'preparing' && <button className="btn btn-outline text-small">Mark Ready</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3 font-bold">Your Menu</h2>
            <button className="btn btn-primary">+ Add Item</button>
          </div>
          
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--color-surface-sunken)' }}>
                <tr>
                  <th style={{ padding: 'var(--space-4)' }}>Item Name</th>
                  <th style={{ padding: 'var(--space-4)' }}>Price</th>
                  <th style={{ padding: 'var(--space-4)' }}>Status</th>
                  <th style={{ padding: 'var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-4)', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: 'var(--space-4)' }}>₹{item.price}</td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={item.isAvailable} />
                        <span className={item.isAvailable ? 'text-success' : 'text-muted'}>
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </label>
                    </td>
                    <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                      <button className="text-primary font-medium mr-4">Edit</button>
                      <button className="text-error font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Today's Orders</p>
            <p className="text-h2 font-bold">42</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Today's Revenue</p>
            <p className="text-h2 font-bold">₹14,500</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Average Rating</p>
            <p className="text-h2 font-bold">4.6 ★</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Bestseller</p>
            <p className="text-h3 font-bold">Cheese Burger</p>
          </div>
        </div>
      )}
    </div>
  );
}
