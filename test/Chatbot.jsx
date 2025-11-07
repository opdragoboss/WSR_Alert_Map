import { useState, useRef, useEffect } from 'react';
import { useDisasters } from './DisasterContext';
import './Chatbot.css';

function Chatbot() {
  const { 
    disasters, 
    userLocation, 
    getDisastersNearLocation, 
    getDisastersByType,
    lastUpdated 
  } = useDisasters();

  const [messages, setMessages] = useState([
    { 
      text: "Hi! I'm an AI assistant analyzing real-time NASA disaster data. Ask me anything about fires, storms, earthquakes, or disasters near you!", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const buildDisasterContext = () => {
    let context = `Current disaster data summary:\n`;
    context += `- Total active disasters worldwide: ${disasters.length}\n`;
    
    if (userLocation) {
      const nearby = getDisastersNearLocation(userLocation.lat, userLocation.lon, 100);
      context += `- User location: Lat ${userLocation.lat.toFixed(2)}, Lon ${userLocation.lon.toFixed(2)}\n`;
      context += `- Disasters within 100 miles: ${nearby.length}\n`;
      
      if (nearby.length > 0) {
        context += `\nNearby disasters:\n`;
        nearby.slice(0, 5).forEach((d, i) => {
          context += `${i + 1}. ${d.title} (${d.category}) - ${Math.round(d.distance)} miles away\n`;
        });
      }
    } else {
      context += `- User location: Not available\n`;
    }
    
    const categories = {};
    disasters.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });
    
    context += `\nDisasters by category:\n`;
    Object.entries(categories).forEach(([cat, count]) => {
      context += `- ${cat}: ${count}\n`;
    });
    
    if (lastUpdated) {
      const timeSince = getTimeSinceUpdate();
      context += `\nData last updated: ${timeSince}\n`;
    }
    
    return context;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage(userMessage, 'user');
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error('GROQ API key not found. Make sure .env file exists with VITE_GROQ_API_KEY and restart dev server');
      }

      if (!apiKey.startsWith('gsk_')) {
        throw new Error('Invalid API key format. Groq keys should start with "gsk_"');
      }

      const disasterContext = buildDisasterContext();
      
      const systemPrompt = `You are a helpful disaster information assistant. You analyze real-time NASA disaster data and help users understand risks and safety information.

${disasterContext}

Guidelines:
- Be concise and helpful
- Use emojis appropriately (🔥 for fires, ⚡ for storms, 🌋 for volcanoes, 🌊 for floods, etc.)
- If user asks about nearby disasters and location is not available, tell them to enable location
- Provide safety advice when relevant
- If the data shows no disasters near them, reassure them they're safe
- Use the disaster data provided above to answer questions
- Format responses clearly with line breaks for readability`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Go to https://console.groq.com/keys to get a new key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content;
      
      if (!botResponse) {
        throw new Error('No response from AI model');
      }
      
      addMessage(botResponse, 'bot');
      
    } catch (error) {
      console.error('Chatbot error:', error);
      
      let errorMessage = 'Error: ';
      
      if (error.message.includes('API key')) {
        errorMessage = error.message;
      } else if (error.message.includes('Rate limit')) {
        errorMessage = error.message;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Unable to connect to Groq API. Check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      addMessage(errorMessage, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'recently';
    
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>🤖 AI Disaster Assistant</h3>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          {userLocation && '📍 '}
          {disasters.length} disasters tracked
        </div>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about disasters..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;