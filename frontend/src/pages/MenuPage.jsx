import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function MenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const sessionId = location.state?.sessionId || localStorage.getItem('sessionId');

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Update filtered items when category or search changes
  useEffect(() => {
    let items = menuItems;
    
        // Filter by category
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query with smart word matching
    if (searchQuery.trim()) {
      const searchWords = searchQuery.toLowerCase().trim().split(/\s+/);
      
      items = items.filter(item => {
        const searchableText = [
          item.name || '',
          item.description || '',
          item.category || ''
        ].join(' ').toLowerCase();
        
        // Check if ALL search words are contained in the item text
        return searchWords.every(word => 
          searchableText.includes(word)
        );
      });
    }
    
    setFilteredItems(items);
  }, [menuItems, selectedCategory, searchQuery]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menu-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      console.log('Menu items loaded:', data);
      
      // Remove duplicates and validate data structure
      const uniqueItems = [];
      const seenIds = new Set();
      const seenNames = new Set();
      
      data.forEach(item => {
        if (item && typeof item === 'object' && item.id) {
          // Check for duplicate IDs
          if (seenIds.has(item.id)) {
            console.warn(`Duplicate ID found: ${item.id}, skipping...`);
            return;
          }
          
          // Check for duplicate names (case insensitive)
          const itemName = (item.name || '').toLowerCase().trim();
          if (itemName && seenNames.has(itemName)) {
            console.warn(`Duplicate name found: ${item.name}, skipping...`);
            return;
          }
          
          seenIds.add(item.id);
          if (itemName) seenNames.add(itemName);
          uniqueItems.push(item);
        }
      });
      
      console.log(`Loaded ${uniqueItems.length} unique items (filtered from ${data.length} total)`);
      setMenuItems(uniqueItems);
      setFilteredItems(uniqueItems);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];

  // Set default category to first category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // If new item, add to cart
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get item quantity in cart
  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
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
                <span className="fs-5 me-2">🍽️</span>
                <span className="fw-semibold fs-6">TableTalk</span>
              </div>
              {/* Cart Button */}
              <button 
                className="btn btn-outline-dark position-relative"
                style={{minWidth: '32px', minHeight: '32px', padding: '4px'}}
                onClick={() => navigate('/cart', { state: { cartItems, user } })}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m4.5-5a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '10px'}}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid" style={{paddingTop: '96px', paddingBottom: '20px', maxWidth: '390px'}}>
        
        {/* Welcome Header */}
        <div className="text-center mb-4">
          <h2 className="text-white mb-2">Choose Your Meal</h2>
          <p className="text-muted">Hi, {user.name?.split(' ')[0] || 'Guest'}! What would you like to order?</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div style={{margin: '0 12px'}}>
            <div className="bg-light text-dark rounded-4 px-3 py-2 position-relative">
              <div className="d-flex align-items-center">
                <i className="bi bi-search text-secondary me-3" style={{fontSize: '20px'}}></i>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent text-dark p-0 flex-grow-1"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    className="btn p-0 ms-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#dc3545',
                      border: 'none',
                      color: 'white',
                      minWidth: '20px',
                      minHeight: '20px'
                    }}
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x" style={{fontSize: '14px', fontWeight: 'bold', lineHeight: '1'}}></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Filters */}
        <div className="mb-2">
          <div className="d-flex gap-2 overflow-auto pb-2" style={{scrollbarWidth: 'none'}}>
            {['Nasi Goreng', 'Bihun', 'Kwetiau', 'Juice', 'Teh', 'Mie', 'Nasi', 'Express Bowl', 'French Fries', 'Es'].map(quickFilter => (
              <button
                key={quickFilter}
                className={`btn btn-sm text-nowrap ${searchQuery === quickFilter ? 'btn-light text-dark' : 'btn-outline-light'}`}
                onClick={() => setSearchQuery(searchQuery === quickFilter ? '' : quickFilter)}
                style={{
                  minWidth: 'fit-content',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: searchQuery === quickFilter ? 'none' : '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {quickFilter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}

        {/* Category Filter */}
        <div className="mb-4">
          <div className="d-flex gap-2 overflow-auto pb-2" style={{scrollbarWidth: 'none'}}>
            {categories.map(category => (
              <button
                key={category}
                className={`btn btn-sm text-nowrap ${selectedCategory === category ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setSelectedCategory(category)}
                style={{minWidth: 'fit-content'}}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading delicious menu items...</p>
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
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className={`bi ${searchQuery ? 'bi-search' : 'bi-grid'} text-muted`} style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="text-light mb-2">
              {searchQuery ? 'No Results Found' : 'No Items Found'}
            </h4>
            <p className="text-muted mb-4">
              {searchQuery 
                ? `Try using different keywords or check the quick filters above.`
                : 'Try selecting a different category.'
              }
            </p>
            {searchQuery && (
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x me-2"></i>
                  Clear Search
                </button>
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset All
                </button>
              </div>
            )}
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="row g-3">
            {filteredItems.map(item => (
              <div key={item.id} className="col-12">
                <div className="bg-light bg-opacity-10 rounded-4 p-3 border border-secondary border-opacity-25 shimmer-effect">
                  <div className="row g-3">
                    {/* Item Image */}
                    <div className="col-4">
                      <img 
                        src={item.image_url || `https://via.placeholder.com/120x120?text=${(item.name || 'Item')[0]}`}
                        alt={item.name || 'Menu Item'}
                        className="img-fluid rounded-3"
                        style={{width: '100%', height: '100px', objectFit: 'cover'}}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/120x120?text=${(item.name || 'Item')[0]}`;
                        }}
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="col-8">
                      <div className="h-100 d-flex flex-column">
                        <div className="flex-grow-1">
                          <h5 className="text-light fw-bold mb-1">{item.name || 'Menu Item'}</h5>
                          {item.description && (
                            <p className="text-muted small mb-2" style={{fontSize: '12px'}}>
                              {item.description}
                            </p>
                          )}
                          <p className="text-success fw-bold mb-2">
                            Rp {(item.price || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        {/* Add to Cart */}
                        <div className="d-flex align-items-center justify-content-end">
                          {getItemQuantityInCart(item.id) > 0 && (
                            <span className="text-primary small me-2">
                              <i className="bi bi-check-circle me-1"></i>
                              {getItemQuantityInCart(item.id)} in cart
                            </span>
                          )}
                          
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => addToCart(item)}
                            style={{fontSize: '12px'}}
                          >
                            <i className="bi bi-plus me-1"></i>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!loading && menuItems.length > 0 && (
          <div className="text-center mt-5">
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/chat', { state: { user, sessionId } })}
              >
                <i className="bi bi-robot me-2"></i>
                AI Assistant
              </button>
              {getCartItemCount() > 0 && (
                <button 
                  className="btn btn-success"
                  onClick={() => navigate('/cart', { state: { cartItems, user, sessionId } })}
                >
                  <i className="bi bi-cart me-2"></i>
                  View Cart ({getCartItemCount()})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
