import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrder } from '../features/orders/orderSlice';
import CustomModal from '../components/CustomModal';

function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const { loading, error, lastAction } = useSelector((state) => state.orders);
  
  // Check if we're in edit mode - ONLY if explicitly passed via state
  const isEditMode = location.state?.editMode === true;
  const editingOrderId = location.state?.orderId;
  
  // If not in edit mode, clear any leftover editingOrderId
  useEffect(() => {
    if (!isEditMode) {
      localStorage.removeItem('editingOrderId');
    }
  }, [isEditMode]);
  
  // Get cart items and user from navigation state or localStorage
  const [cartItems, setCartItems] = useState(() => {
    const stateCartItems = location.state?.cartItems;
    if (stateCartItems && stateCartItems.length > 0) {
      return stateCartItems;
    }
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const sessionId = location.state?.sessionId || localStorage.getItem('sessionId');

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

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item
  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate total
  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle update order (for edit mode) - menggunakan Redux
  const handleUpdateOrder = async () => {
    if (!isEditMode || !editingOrderId) {
      console.error('Not in edit mode or missing order ID');
      return;
    }
    
    try {
      // Dispatch updateOrder action - seperti di lecture redux
      await dispatch(updateOrder({
        orderId: editingOrderId,
        orderData: {
          items: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity
          }))
        }
      })).unwrap(); // unwrap untuk handle promise

      // Clear edit mode and cart
      localStorage.removeItem('editingOrderId');
      localStorage.removeItem('cartItems');
      
      // Show success modal
      setModalConfig({
        type: 'success',
        title: 'Order Updated!',
        message: 'Your order has been successfully updated.',
        confirmText: 'View Orders',
        showCancel: false,
        onConfirm: () => {
          setShowModal(false);
          navigate('/orders');
        },
        isLoading: false
      });
      setShowModal(true);
      
    } catch (error) {
      console.error('Error updating order:', error);
      
      // Show error modal
      setModalConfig({
        type: 'danger',
        title: 'Update Failed',
        message: error.message || 'Failed to update order. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setShowModal(false),
        isLoading: false
      });
      setShowModal(true);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setModalConfig({
      type: 'warning',
      title: 'Cancel Edit',
      message: 'Are you sure you want to cancel editing? All changes will be lost.',
      confirmText: 'Yes, Cancel',
      cancelText: 'Keep Editing',
      showCancel: true,
      onConfirm: () => {
        localStorage.removeItem('editingOrderId');
        setShowModal(false);
        navigate('/orders');
      },
      isLoading: false
    });
    setShowModal(true);
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Floating Navbar */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <button 
                onClick={() => navigate('/choice')}
                className="btn btn-link text-dark p-0"
                style={{minWidth: '32px', minHeight: '32px'}}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">{isEditMode ? '✏️' : '🛒'}</span>
                <span className="fw-semibold fs-6">
                  {isEditMode ? `Edit Order #${editingOrderId}` : 'Your Cart'}
                </span>
              </div>
              <div className="text-muted small">
                {getTotalItems()} items
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex flex-column" style={{minHeight: '100vh', paddingTop: '70px', paddingBottom: '80px'}}>
        <div className="flex-grow-1 px-3 pb-3" style={{paddingTop: '1rem'}}>
          
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center text-white" style={{marginTop: '20vh'}}>
              <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15" 
                     style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">🛒</span>
                </div>
                <h2 className="h4 fw-bold mb-2 text-light">Your cart is empty</h2>
                <p className="text-light text-opacity-75 small mb-4">
                  Start chatting with AI or browse menu to add items
                </p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/choice')}
                  >
                    Start Ordering
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="d-flex flex-column gap-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-dark bg-opacity-75 rounded-4 p-3 border border-secondary border-opacity-25">
                  <div className="d-flex gap-3">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="rounded"
                        style={{width: '80px', height: '80px', objectFit: 'cover'}}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=🍽️';
                        }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <h3 className="h6 fw-bold mb-1 text-light">{item.name}</h3>
                      <p className="text-primary fw-semibold mb-2">
                        Rp {item.price?.toLocaleString('id-ID') || 'N/A'}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <button 
                            className="btn btn-outline-light btn-sm"
                            style={{width: '32px', height: '32px', padding: '0'}}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="text-light fw-semibold" style={{minWidth: '20px', textAlign: 'center'}}>
                            {item.quantity}
                          </span>
                          <button 
                            className="btn btn-outline-light btn-sm"
                            style={{width: '32px', height: '32px', padding: '0'}}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(item.id)}
                          style={{fontSize: '12px'}}
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="mt-2">
                        <small className="text-light text-opacity-75">
                          Subtotal: <span className="text-success fw-semibold">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Summary - Fixed */}
        {cartItems.length > 0 && (
          <div className="position-fixed bottom-0 start-50 translate-middle-x w-100" style={{maxWidth: '390px', padding: '12px'}}>
            <div className="bg-dark bg-opacity-90 rounded-4 p-3 border border-secondary border-opacity-25">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="h6 fw-bold text-light mb-1">Total ({getTotalItems()} items)</h4>
                  <p className="h5 fw-bold text-success mb-0">
                    Rp {getTotal().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                {isEditMode ? (
                  <>
                    <button 
                      className="btn btn-success fw-semibold"
                      onClick={handleUpdateOrder}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      Update Order
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleCancelEdit}
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-success fw-semibold"
                      onClick={() => navigate('/payment', { state: { cartItems, user, total: getTotal(), sessionId } })}
                    >
                      Proceed to Payment
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigate('/choice')}
                    >
                      Continue Shopping
                    </button>
                  </>
                )}
              </div>
            </div>
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

export default CartPage;
