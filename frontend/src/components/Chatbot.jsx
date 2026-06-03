import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, User, Bot, HelpCircle, Phone, MapPin, Sparkles } from 'lucide-react';
import api from '../services/api.js';

const Chatbot = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your SwiftBite AI Assistant. 🤖\nHow can I help you track orders, get recommendations, or reach support today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom on history change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  if (!userInfo) return null; // Chatbot only available for logged-in users

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;
    
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chatbot', { message: textToSend });
      const botMsg = {
        sender: 'bot',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = {
        sender: 'bot',
        text: 'Sorry, I am facing connectivity issues. Please try again! 😥',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  // Quick reply action tags
  const quickReplies = [
    { text: 'Where is my order? 🛵', query: 'where is my order status' },
    { text: 'Food Suggestions 🍔', query: 'suggest some foods' },
    { text: 'Support Contact 📞', query: 'give support phone number email' },
    { text: 'Hello! 👋', query: 'hi hello bot' }
  ];

  return (
    <>
      {/* 1. Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(255, 94, 58, 0.4)',
            zIndex: 999,
            transition: 'transform var(--transition-normal)'
          }}
          className="chatbot-toggle animate-float"
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* 2. Chat Overlay Box */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '90%',
          maxWidth: '380px',
          height: '500px',
          backgroundColor: 'rgba(30, 30, 38, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s ease forwards'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, var(--primary) 0%, rgba(255, 140, 66, 0.9) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}>
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>SwiftBite AI Help</h4>
                <span style={{ fontSize: '11px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flexGrow: 1,
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            scrollbarWidth: 'thin'
          }} className="category-scroll">
            {chatHistory.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    gap: '8px',
                    flexDirection: isBot ? 'row' : 'row-reverse'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isBot ? 'var(--primary-glow)' : 'rgba(59, 130, 246, 0.1)',
                    color: isBot ? 'var(--primary)' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '12px'
                  }}>
                    {isBot ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  {/* Message Bubble */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      backgroundColor: isBot ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)',
                      color: isBot ? 'var(--text-main)' : '#fff',
                      padding: '10px 14px',
                      borderRadius: isBot ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                      border: isBot ? '1px solid var(--border)' : 'none',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      whiteSpace: 'pre-line'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: isBot ? 'left' : 'right' }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={14} />
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  padding: '12px 16px',
                  borderRadius: '0px 12px 12px 12px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'typing 1s infinite' }} />
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'typing 1s infinite 0.2s' }} />
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'typing 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies row */}
          <div style={{
            padding: '8px 12px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(0,0,0,0.1)',
            scrollbarWidth: 'none'
          }} className="category-scroll">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qr.query)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background var(--transition-normal)'
                }}
                className="category-btn"
              >
                {qr.text}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Ask support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flexGrow: 1,
                height: '38px',
                padding: '0 12px',
                fontSize: '13px'
              }}
              className="input-field"
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Chatbot typing animation style */}
      <style>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chatbot-toggle:hover {
          transform: scale(1.08) translateY(-4px);
        }
      `}</style>
    </>
  );
};

export default Chatbot;
