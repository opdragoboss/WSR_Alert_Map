import { useEffect, useRef, useState } from 'react';
import { useDisasters } from '../../context/DisasterContext';
import './Chatbot.css';

function Chatbot() {
  const { disasters, userLocation, getDisastersNearLocation, lastUpdated } = useDisasters();

  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your AI disaster assistant. Ask me about wildfires, storms, or other hazards near you!",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'recently';
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  const buildDisasterContext = () => {
    let context = `NASA disaster snapshot:\n`;
    context += `- Total tracked disasters: ${disasters.length}\n`;

    if (userLocation) {
      const nearby = getDisastersNearLocation(userLocation.lat, userLocation.lon, 200);
      context += `- User location: Lat ${userLocation.lat.toFixed(2)}, Lon ${userLocation.lon.toFixed(
        2
      )}\n`;
      context += `- Disasters within 200 miles: ${nearby.length}\n`;

      if (nearby.length > 0) {
        context += `\nClosest events:\n`;
        nearby.slice(0, 5).forEach((event, index) => {
          context += `${index + 1}. ${event.title} (${event.category}) - ${Math.round(
            event.distance
          )} miles away\n`;
        });
      }
    } else {
      context += `- User location unavailable (prompt user to enable location services)\n`;
    }

    const categories = {};
    disasters.forEach((event) => {
      const cat = event.category || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    context += `\nDisasters by category:\n`;
    Object.entries(categories).forEach(([name, count]) => {
      context += `- ${name}: ${count}\n`;
    });

    if (lastUpdated) {
      context += `\nData updated: ${getTimeSinceUpdate()}\n`;
    }

    return context;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const question = input.trim();
    addMessage(question, 'user');
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error(
          'Groq API key missing. Set REACT_APP_GROQ_API_KEY in your frontend .env file and restart.'
        );
      }
      if (!apiKey.startsWith('gsk_')) {
        throw new Error('Groq API key appears invalid. Keys should start with "gsk_".');
      }

      const disasterContext = buildDisasterContext();
      const systemPrompt = `You are a friendly disaster information assistant using NASA EONET data. Only use data from within the past week.'

${disasterContext}

Guidelines:
- Be concise and factual.
- Use emojis for clarity (🔥 fires, 🌪️ storms, 🌊 floods, 🌋 volcanoes).
- If no nearby events exist, reassure the user.
- Offer relevant safety tips when appropriate.
- If location is unavailable, remind the user how to enable it.
- Format responses with short paragraphs or bullet points for readability.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        let errorText = `Groq API error (${response.status})`;
        if (response.status === 401) {
          errorText = 'Groq rejected the API key (401). Generate a fresh token at https://console.groq.com/keys';
        } else if (response.status === 429) {
          errorText = 'Groq rate limit hit (429). Wait a moment and try again.';
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      const botMessage = data.choices?.[0]?.message?.content;
      if (!botMessage) {
        throw new Error('Groq API returned an empty response.');
      }
      addMessage(botMessage, 'bot');
    } catch (error) {
      console.error('Chatbot error:', error);
      addMessage(error.message || 'Something went wrong. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isMinimized ? 'is-minimized' : ''}`}>
      <div className="chatbot-header">
        <h3>🤖 AI Disaster Assistant</h3>
        <div className="chatbot-header-actions">
          <span className="location-indicator">
            {userLocation ? '📍 Using your location' : '📍 Enable location for nearby updates'}
          </span>
          <button
            type="button"
            className="chatbot-toggle"
            onClick={() => setIsMinimized((prev) => !prev)}
            aria-label={isMinimized ? 'Expand chatbot' : 'Minimize chatbot'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  {message.text.split('\n').map((line, lineIdx) => (
                    <span key={lineIdx}>
                      {line}
                      {lineIdx < message.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-bubble loading">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              placeholder="Ask about wildfires, storms, etc."
              disabled={isLoading}
            />
            <button type="button" onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbot;

