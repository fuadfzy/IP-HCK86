import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hi! I\'m your AI food assistant. What would you like to eat today?'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Based on your preferences, I recommend our signature dishes! Let me show you some options...'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="chat-page">
      <header className="mobile-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <div className="brand-logo">
            <span className="brand-name">AI Assistant</span>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        <div className="mobile-container">
          <section className="chat-section">
            <div className="chat-messages">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <div className="input-container">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask for food recommendations..."
                  className="chat-input"
                />
                <button type="submit" className="send-btn">
                  Send
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
