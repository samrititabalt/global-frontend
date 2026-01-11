import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import api from '../../utils/axios';

const LiveChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! Welcome to Tabalt 👋\nBefore we begin, could you please share your email address and phone number?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef([]);

  useEffect(() => {
    chatHistoryRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Extract email and phone from text
  const extractEmail = (text) => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  };

  const extractPhone = (text) => {
    // Match various phone formats: +44, 07, (0), spaces, dashes, parentheses, etc.
    // More flexible regex to catch UK and international numbers
    const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/gi;
    const matches = text.match(phoneRegex);
    if (matches && matches.length > 0) {
      // Clean up the phone number but keep structure
      let phone = matches[0].trim();
      // Remove spaces, dashes, parentheses but keep + if present
      phone = phone.replace(/[\s-()]/g, '');
      // Ensure it has at least 10 digits
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 10) {
        return phone;
      }
    }
    return null;
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (UK format or international)
  const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    // Remove spaces, dashes, parentheses for validation
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    // Must have at least 10 digits (for UK numbers) or 11+ with country code
    const digits = cleanPhone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  };

  // Extract name from text
  const extractName = (text) => {
    if (!text || typeof text !== 'string') return null;
    const namePatterns = [
      /(?:my name is|i'm|i am|call me|this is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length <= 50 && name.split(' ').length <= 5) {
          return name;
        }
      }
    }
    return null;
  };

  // Extract company from text
  const extractCompany = (text) => {
    if (!text || typeof text !== 'string') return null;
    const companyPatterns = [
      /(?:company|firm|organization|organisation|i work for|i work at|from)\s+([A-Z][a-zA-Z0-9\s&]+)/i,
      /(?:at|with)\s+([A-Z][a-zA-Z0-9\s&]+)/i,
    ];
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim();
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'at'];
        if (company.length <= 100 && !commonWords.includes(company.toLowerCase())) {
          return company;
        }
      }
    }
    return null;
  };

  // Get UTM parameters from URL
  const getUTMParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || null,
      campaign: params.get('utm_campaign') || null,
      medium: params.get('utm_medium') || null,
      term: params.get('utm_term') || null,
      content: params.get('utm_content') || null
    };
  };

  // Build chat transcript
  const buildTranscript = (allMessages) => {
    return allMessages
      .filter(msg => msg.id !== 1) // Exclude initial greeting
      .map(msg => {
        const sender = msg.sender === 'user' ? 'Visitor' : 'Tabalt Support';
        const time = msg.timestamp instanceof Date 
          ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join('\n');
  };

  // Send contact info to new chatbot lead endpoint
  const sendContactInfo = async (email, phoneNumber, name, company, allMessages) => {
    try {
      // Build transcript
      const transcript = buildTranscript(allMessages);
      
      // Get page URL and UTM params
      const pageUrl = typeof window !== 'undefined' ? window.location.href : null;
      const utm = getUTMParams();
      
      // Generate client request ID for idempotency
      const clientRequestId = `chatbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await api.post('/chatbot/lead', {
        email,
        phone: phoneNumber,
        name: name || null,
        company: company || null,
        transcript: transcript || null,
        consent: consentGiven,
        pageUrl,
        utm,
        clientRequestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending contact info:', error);
      // Don't fail the chat if lead creation fails
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // If onboarding is not complete, extract email and phone
    if (!onboardingComplete) {
      // Extract email and phone from all messages (including current and previous)
      let extractedEmail = extractEmail(messageText);
      let extractedPhone = extractPhone(messageText);

      // Also check previous messages if not found in current message
      if (!extractedEmail || !extractedPhone) {
        for (const msg of messages) {
          if (msg.sender === 'user' && msg.text) {
            if (!extractedEmail) extractedEmail = extractEmail(msg.text);
            if (!extractedPhone) extractedPhone = extractPhone(msg.text);
            if (extractedEmail && extractedPhone) break;
          }
        }
      }

      // Determine current values: prefer stored, then extracted
      const currentEmail = userEmail || extractedEmail || '';
      const currentPhone = userPhone || extractedPhone || '';

      // Update state if we found new values
      if (extractedEmail && extractedEmail !== userEmail) {
        setUserEmail(extractedEmail);
      }
      if (extractedPhone && extractedPhone !== userPhone) {
        setUserPhone(extractedPhone);
      }

      // Validate and check if we have both
      if (currentEmail && currentPhone) {
        // Validate email format
        if (!isValidEmail(currentEmail)) {
          setIsTyping(false);
          const validationMessage = {
            id: Date.now() + 1,
            text: 'I received an email address, but it doesn\'t appear to be in a valid format. Could you please provide a valid email address?',
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, validationMessage]);
          return;
        }

        // Validate phone number
        if (!isValidPhone(currentPhone)) {
          setIsTyping(false);
          const validationMessage = {
            id: Date.now() + 1,
            text: 'I received a phone number, but it doesn\'t appear to be valid. Could you please provide a valid phone number (including country code if outside UK)?',
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, validationMessage]);
          return;
        }

        // Both are valid - send to agent and complete onboarding
        await sendContactInfo(currentEmail, currentPhone);
        setOnboardingComplete(true);

        const onboardingCompleteMessage = {
          id: Date.now() + 1,
          text: 'Perfect! Thank you for providing your contact information. How can I help you today?',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, onboardingCompleteMessage]);
        setIsTyping(false);
      } else {
        // Still missing information
        setIsTyping(false);
        let missingInfo = [];
        if (!currentEmail) missingInfo.push('email address');
        if (!currentPhone) missingInfo.push('phone number');

        const promptMessage = {
          id: Date.now() + 1,
          text: `I still need your ${missingInfo.join(' and ')}. Could you please share ${missingInfo.length > 1 ? 'both' : 'it'}?`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, promptMessage]);
      }
    } else {
      // Onboarding complete - use GPT-4 Mini
      try {
        // Prepare chat history for API (include all messages for context)
        const conversationHistory = messages
          .filter(msg => msg.id !== 1) // Exclude only the initial greeting
          .map(msg => ({
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp
          }));

        const response = await api.post('/public/chatbot-message', {
          message: messageText,
          chatHistory: conversationHistory,
        });

        if (response.data.success) {
          const botResponse = {
            id: Date.now() + 1,
            text: response.data.message,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
        } else {
          throw new Error(response.data.message || 'Failed to get response');
        }
      } catch (error) {
        console.error('Chatbot API error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: 'I apologize, but I\'m having trouble processing your message right now. Please try again in a moment.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Build chat transcript for email
  const buildTranscriptForEmail = (allMessages) => {
    return allMessages
      .map(msg => {
        const sender = msg.sender === 'user' ? 'Visitor' : 'Tabalt Support';
        const time = msg.timestamp instanceof Date 
          ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join('\n');
  };

  // Send chat transcript on close
  const sendChatTranscriptOnClose = async () => {
    try {
      // Only send if there are messages (user typed something)
      if (messages.length <= 1) {
        return; // Only initial greeting, no actual conversation
      }

      const transcript = buildTranscriptForEmail(messages);
      const pageUrl = typeof window !== 'undefined' ? window.location.href : null;
      const timestamp = new Date().toISOString();

      await api.post('/chatbot/send-chat-transcript', {
        transcript,
        pageUrl,
        timestamp,
        email: userEmail || null,
        phone: userPhone || null,
        name: userName || null,
        company: userCompany || null,
        consent: consentGiven || false
      });
    } catch (error) {
      console.error('Error sending chat transcript:', error);
      // Don't show error to user - fail silently
    }
  };

  const handleClose = async () => {
    // Send transcript email before closing
    await sendChatTranscriptOnClose();
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Reset chat when reopening (fresh conversation)
  const handleOpen = () => {
    setIsOpen(true);
    // Reset onboarding state and messages for fresh conversation
    setOnboardingComplete(false);
    setUserEmail('');
    setUserPhone('');
    setUserName('');
    setUserCompany('');
    setConsentGiven(false);
    setMessages([
      {
        id: 1,
        text: 'Hi! Welcome to Tabalt 👋\nBefore we begin, could you please share your email address and phone number?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <h3 className="font-semibold">Tabalt Support</h3>
                <p className="text-xs text-blue-100">We're here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-blue-800 rounded transition"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-blue-800 rounded transition"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Your chat history will be sent to our team
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChatBot;

