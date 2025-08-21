import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteOrder } from '../features/orders/orderSlice';

function OrderCard({ order, onEdit, onPay }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      dispatch(deleteOrder(order.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', icon: '⏳', text: 'Pending' },
      paid: { class: 'bg-success text-white', icon: '✅', text: 'Paid' },
      failed: { class: 'bg-danger text-white', icon: '❌', text: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge ${config.class} small`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-dark bg-opacity-75 rounded-4 p-3 border border-secondary border-opacity-25">
      {/* Order Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="text-light fw-bold mb-1">Order #{order.id}</h6>
          <small className="text-muted">{formatDate(order.createdAt)}</small>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Items */}
      <div className="mb-3">
        {order.OrderItems && order.OrderItems.length > 0 ? (
          order.OrderItems.map((item, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                {item.MenuItem?.image_url && (
                  <img 
                    src={item.MenuItem.image_url} 
                    alt={item.MenuItem.name}
                    className="rounded me-2"
                    style={{width: '40px', height: '40px', objectFit: 'cover'}}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40x40?text=🍽️';
                    }}
                  />
                )}
                <div>
                  <small className="text-light fw-semibold">
                    {item.MenuItem?.name || 'Unknown Item'}
                  </small>
                  <br />
                  <small className="text-muted">
                    {item.quantity}x @ Rp {(item.MenuItem?.price || 0).toLocaleString('id-ID')}
                  </small>
                </div>
              </div>
              <small className="text-success fw-semibold">
                Rp {(item.total_price || 0).toLocaleString('id-ID')}
              </small>
            </div>
          ))
        ) : (
          <small className="text-muted">No items found</small>
        )}
      </div>

      {/* Order Total */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-light fw-semibold">Total:</span>
        <span className="text-success fw-bold fs-6">
          Rp {(order.total || 0).toLocaleString('id-ID')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        {order.status === 'pending' && (
          <>
            <button 
              className="btn btn-success btn-sm flex-fill"
              onClick={() => onPay(order)}
            >
              <i className="bi bi-credit-card me-1"></i>
              Pay Now
            </button>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => onEdit(order)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleDelete}
            >
              <i className="bi bi-trash"></i>
            </button>
          </>
        )}
        
        {order.status === 'paid' && (
          <div className="text-center w-100">
            <small className="text-muted">Order completed successfully</small>
          </div>
        )}
        
        {order.status === 'failed' && (
          <button 
            className="btn btn-warning btn-sm flex-fill"
            onClick={() => onPay(order)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry Payment
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderCard;
