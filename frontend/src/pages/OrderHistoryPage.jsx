import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, clearError, clearLastAction } from '../features/orders/orderSlice';
import OrderCard from '../components/OrderCard';
import CustomModal from '../components/CustomModal';

function OrderHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state - useSelector untuk mengambil data dari store
  const { list: orders, loading, error, lastAction } = useSelector((state) => state.orders);
  
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const sessionId = localStorage.getItem('sessionId');

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

  // useEffect untuk fetch data saat component mount
  useEffect(() => {
    // 1. Dispatch fetchOrders action - seperti di HomePage lecture
    dispatch(fetchOrders(sessionId));
    
    // Auto-refresh every 5 seconds to catch payment status updates
    const interval = setInterval(() => {
      dispatch(fetchOrders(sessionId));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dispatch, sessionId]);

  // Handle Redux lastAction untuk show notifications
  useEffect(() => {
    if (lastAction === 'delete_success') {
      setModalConfig({
        type: 'success',
        title: 'Order Deleted',
        message: 'Order has been successfully deleted.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setShowModal(false);
          dispatch(clearLastAction());
        },
        isLoading: false
      });
      setShowModal(true);
    } else if (lastAction === 'delete_error') {
      setModalConfig({
        type: 'danger',
        title: 'Delete Failed',
        message: error || 'Failed to delete order. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setShowModal(false);
          dispatch(clearError());
          dispatch(clearLastAction());
        },
        isLoading: false
      });
      setShowModal(true);
    }
  }, [lastAction, error, dispatch]);

  const handleEditOrder = (order) => {
    // Convert order items to cart format and navigate to cart
    const cartItems = order.OrderItems.map(item => ({
      id: item.MenuItem.id,
      name: item.MenuItem.name,
      price: item.MenuItem.price,
      image_url: item.MenuItem.image_url,
      quantity: item.quantity
    }));
    
    // Navigate to cart in edit mode with explicit state
    navigate('/cart', { 
      state: { 
        editMode: true,
        orderId: order.id,
        cartItems: cartItems,
        user,
        message: `Editing Order #${order.id}` 
      } 
    });
  };

  const handlePayOrder = (order) => {
    // Calculate total items for display
    const totalItems = order.OrderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Navigate to payment page with existing order
    navigate('/payment', {
      state: {
        existingOrderId: order.id,
        total: parseInt(order.total, 10),
        user,
        orderItems: order.OrderItems,
        cartItems: [], // Empty since this is existing order
        totalItems: totalItems
      }
    });
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
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onEdit={handleEditOrder}
                onPay={handlePayOrder}
              />
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
