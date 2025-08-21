import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from location state or localStorage
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  
  // Initialize messages with persistence
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    return [
      {
        id: 1,
        type: 'ai',
        text: `Selamat datang di TableTalk, ${user.name?.split(' ')[0] || 'Kak'}! Saya siap membantu, mau pesan makanan atau minuman?`
      }
    ];
  });
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize cart with persistence
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  // Get total items in cart
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Clear chat history
  const clearChat = () => {
    const initialMessage = {
      id: 1,
      type: 'ai',
      text: `Selamat datang di TableTalk, ${user.name?.split(' ')[0] || 'Kak'}! Saya siap membantu, mau pesan makanan atau minuman?`
    };
    setMessages([initialMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare messages for API call
      const apiMessages = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add current user message
      apiMessages.push({
        role: 'user',
        content: inputText
      });

      // Call backend AI endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Check if response contains JSON array (recommendations)
      let aiResponseText = data.reply;
      let isRecommendation = false;
      let recommendations = [];
      
      try {
        // Check if response is a JSON array of recommendations
        const jsonMatch = aiResponseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
          isRecommendation = Array.isArray(recommendations) && recommendations.length > 0;
          if (isRecommendation) {
            aiResponseText = "Ini dia rekomendasi menu untuk Anda:";
          }
        }
      } catch (e) {
        // Not a JSON response, use text as is
      }
      
      // Add AI response to messages
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponseText,
        recommendations: isRecommendation ? recommendations : null
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Error calling AI chat:', error);
      
      // Fallback response
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Maaf, ada gangguan koneksi. Silakan coba lagi dalam beberapa saat.'
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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
                <span className="fs-5 me-2">🤖</span>
                <span className="fw-semibold fs-6">AI Assistant</span>
              </div>
              <button 
                onClick={clearChat}
                className="btn btn-outline-dark btn-sm"
                style={{fontSize: '12px', padding: '4px 8px'}}
                title="Reset Chat"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Messages Area */}
      <div className="d-flex flex-column" style={{minHeight: '100vh', paddingTop: '70px', paddingBottom: '80px'}}>
        <div className="flex-grow-1 px-3 pb-3" style={{overflowY: 'auto', paddingTop: '1rem'}}>
          <div className="d-flex flex-column gap-3">
            {messages.map(message => (
              <div key={message.id} className={`d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`rounded-4 p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-white ms-5' 
                    : 'bg-light text-dark me-5'
                }`} style={{maxWidth: '80%'}}>
                  {message.type === 'ai' && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-6">🤖</span>
                      <small className="text-muted fw-semibold">AI Assistant</small>
                    </div>
                  )}
                  <p className="mb-0 small">{message.text}</p>
                  
                  {/* Show menu recommendations if available */}
                  {message.recommendations && (
                    <div className="mt-3">
                      <div className="row g-2">
                        {message.recommendations.map((item, index) => (
                          <div key={item.id || index} className="col-12">
                            <div className="card bg-white border-0 shadow-sm">
                              <div className="card-body p-3">
                                <div className="d-flex gap-3">
                                  {item.image_url && (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.name}
                                      className="rounded"
                                      style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/60x60?text=🍽️';
                                      }}
                                    />
                                  )}
                                  <div className="flex-grow-1">
                                    <h6 className="card-title mb-1 fw-bold" style={{fontSize: '14px'}}>
                                      {item.name}
                                    </h6>
                                    <p className="card-text text-primary fw-semibold mb-2" style={{fontSize: '13px'}}>
                                      Rp {item.price?.toLocaleString('id-ID') || 'N/A'}
                                    </p>
                                    <button 
                                      className="btn btn-outline-primary btn-sm"
                                      style={{fontSize: '12px', padding: '4px 12px'}}
                                      onClick={() => {
                                        // Add item to cart only
                                        addToCart(item);
                                      }}
                                    >
                                      Pilih Menu
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="d-flex justify-content-start">
                <div className="bg-light text-dark rounded-4 p-3 me-5" style={{maxWidth: '80%'}}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-6">🤖</span>
                    <small className="text-muted fw-semibold">AI Assistant</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small className="text-muted">Thinking...</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="position-fixed bottom-0 start-50 translate-middle-x w-100" style={{maxWidth: '390px', padding: '12px'}}>
          
          {/* Cart Icon - Outside the input container */}
          {getTotalCartItems() > 0 && (
            <div className="d-flex justify-content-end mb-2">
              <button
                type="button"
                className="btn btn-light position-relative"
                onClick={() => navigate('/cart', { state: { cartItems, user } })}
                style={{borderRadius: '50%', width: '48px', height: '48px'}}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L4 3m3 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0v-6a1 1 0 011-1h6a1 1 0 011 1v6" />
                </svg>
                {getTotalCartItems() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '10px'}}>
                    {getTotalCartItems()}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Input Container */}
          <form onSubmit={handleSendMessage} className="bg-dark bg-opacity-75 rounded-4 p-3 border border-secondary border-opacity-25">
            <div className="input-group">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanyakan rekomendasi makanan..."
                className="form-control bg-light border-0"
                style={{borderRadius: '12px 0 0 12px'}}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="btn btn-primary px-4"
                style={{borderRadius: '0 12px 12px 0'}}
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
