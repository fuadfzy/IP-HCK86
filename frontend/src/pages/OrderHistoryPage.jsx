import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    isLoading: false
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 5 seconds to catch payment status updates
    const interval = setInterval(fetchOrders, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // For now, we'll get orders from a specific session or user
      // Since we don't have user-specific orders, we'll show recent orders
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders${sessionId ? `?session_id=${sessionId}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Pending' },
      'paid': { color: 'success', text: 'Paid' },
      'failed': { color: 'danger', text: 'Failed' },
      'cancelled': { color: 'secondary', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', text: status };
    
    return (
      <span className={`badge bg-${config.color} bg-opacity-25 text-${config.color} border border-${config.color} border-opacity-50`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteOrder = async (orderId) => {
    // Show confirmation modal
    setModalConfig({
      type: 'warning',
      title: 'Delete Order',
      message: `Are you sure you want to delete Order #${orderId}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => confirmDeleteOrder(orderId),
      isLoading: false
    });
    setShowModal(true);
  };

  const confirmDeleteOrder = async (orderId) => {
    // Update modal to loading state
    setModalConfig(prev => ({ ...prev, isLoading: true }));
    setDeletingOrderId(orderId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      // Remove order from state
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Show success modal
      setShowModal(false);
      setTimeout(() => {
        setModalConfig({
          type: 'success',
          title: 'Order Deleted',
          message: 'Order has been successfully deleted.',
          confirmText: 'OK',
          showCancel: false,
          onConfirm: () => setShowModal(false),
          isLoading: false
        });
        setShowModal(true);
      }, 300);
      
    } catch (err) {
      console.error('Error deleting order:', err);
      
      // Show error modal
      setShowModal(false);
      setTimeout(() => {
        setModalConfig({
          type: 'danger',
          title: 'Delete Failed',
          message: err.message || 'Failed to delete order. Please try again.',
          confirmText: 'OK',
          showCancel: false,
          onConfirm: () => setShowModal(false),
          isLoading: false
        });
        setShowModal(true);
      }, 300);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleEditOrder = (order) => {
    // Convert order items to cart format and navigate to cart
    const cartItems = order.OrderItems.map(item => ({
      id: item.MenuItem.id,
      name: item.MenuItem.name,
      price: item.MenuItem.price,
      image: item.MenuItem.image,
      quantity: item.quantity
    }));
    
    // Navigate to cart in edit mode with explicit state
    navigate('/cart', { 
      state: { 
        editMode: true,
        orderId: order.id,
        cartItems: cartItems,
        message: `Editing Order #${order.id}` 
      } 
    });
  };

  const handlePayOrder = (order) => {
    // Navigate to payment page with existing order
    navigate('/payment', {
      state: {
        existingOrderId: order.id,
        total: order.total,
        user,
        orderItems: order.OrderItems
      }
    });
  };

  const canModifyOrder = (status) => {
    return status === 'pending';
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Floating Navbar */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <button 
                className="btn btn-link text-dark p-0"
                onClick={() => navigate('/choice')}
              >
                <i className="bi bi-arrow-left fs-5"></i>
              </button>
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">📋</span>
                <span className="fw-bold">Order History</span>
              </div>
              <div style={{width: '24px'}}></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container-fluid" style={{paddingTop: '96px', paddingBottom: '20px', maxWidth: '390px'}}>
        
        {/* User Info */}
        <div className="text-center mb-4">
          <h2 className="text-white mb-2">Your Orders</h2>
          <p className="text-muted">Hi, {user.name?.split(' ')[0] || 'Guest'}!</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-25 border-danger text-light">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-receipt text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="text-light mb-2">No Orders Yet</h4>
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/menu')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Start Ordering
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div>
            {orders.map((order, index) => (
              <div key={order.id} className={`bg-light bg-opacity-10 rounded-4 p-4 border border-secondary border-opacity-25 ${index < orders.length - 1 ? 'mb-4' : ''}`}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="text-light fw-bold mb-1">Order #{order.id}</h5>
                    <small className="text-muted">{formatDate(order.createdAt)}</small>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Order Items */}
                {order.OrderItems && order.OrderItems.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-light mb-2">Items:</h6>
                    {order.OrderItems.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between text-sm mb-1">
                        <span className="text-light">
                          {item.MenuItem ? item.MenuItem.name : 'Unknown Item'} x{item.quantity}
                        </span>
                        <span className="text-muted">
                          Rp {(item.total_price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25 pt-3">
                  <span className="text-light fw-bold">Total</span>
                  <span className="text-success fw-bold">
                    Rp {(order.total || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Action Buttons for Pending Orders */}
                {canModifyOrder(order.status) && (
                  <div className="d-flex flex-column gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
                    {/* Primary Action: Pay Now */}
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handlePayOrder(order)}
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Pay Now - Rp {(order.total || 0).toLocaleString('id-ID')}
                    </button>
                    
                    {/* Secondary Actions */}
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-warning btn-sm flex-fill"
                        onClick={() => handleEditOrder(order)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm flex-fill"
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrderId === order.id}
                      >
                        {deletingOrderId === order.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {!loading && orders.length > 0 && (
          <div className="text-center mt-5">
            <button 
              className="btn btn-primary me-3"
              onClick={() => navigate('/menu')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Order Again
            </button>
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/choice')}
            >
              <i className="bi bi-house me-2"></i>
              Home
            </button>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        isLoading={modalConfig.isLoading}
      />
    </div>
  );
}

export default OrderHistoryPage;
