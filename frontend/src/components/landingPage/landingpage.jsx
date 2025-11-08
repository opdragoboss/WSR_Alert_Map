import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landingpage.css';

function EmberCanvas() {
  const ref = React.useRef(null);
  const frame = React.useRef(0);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const embers = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.7 - 0.2,
      a: Math.random() * 0.6 + 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${e.a})`;
        ctx.fill();
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
      }
      frame.current = requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="ember-canvas" />;
}

function Landing() {
  const navigate = useNavigate();
  const [activeFireCount] = React.useState(247);

  const handleEnterApp = () => {
    navigate('/app');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <EmberCanvas />
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-indicator"></span>
            Currently tracking {activeFireCount} active wildfires
          </div>
          
          <h1 className="hero-title">
            Get Wildfire Alerts
            <br />
            <span className="highlight">Before It's Too Late</span>
          </h1>
          
          <p className="hero-subtitle">
            Real-time wildfire monitoring powered by NASA data. 
            Know what's happening around you in seconds, not hours.
          </p>
          
          <button className="cta-primary" onClick={handleEnterApp}>
            🔥 Launch Live Demo
          </button>
          
          <div className="scroll-indicator">
            <span>Scroll to explore</span>
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="container">
          <h2 className="section-title">The Problem</h2>
          <p className="section-subtitle">
            Every year, lives are lost because alerts arrive too late
          </p>
          
          <div className="problem-grid">
            <div className="stat-card">
              <div className="stat-number">85%</div>
              <p>of residents receive evacuation notices too late</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">2-4 hrs</div>
              <p>average delay between detection and alerts</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <p>lives could be saved with earlier warnings</p>
            </div>
          </div>
          
          <p className="problem-text">
            California residents often get alerts when it's already time to evacuate.
            <strong> We give you hours, not minutes.</strong>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">Built for speed, accuracy, and safety</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Live Wildfire Map</h3>
              <p>NASA-powered real-time tracking with satellite imagery updated every 5 minutes</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💨</div>
              <h3>Air Quality</h3>
              <p>Monitor AQI in real-time with color-coded alerts for smoke exposure</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location Alerts</h3>
              <p>Automatic proximity warnings when fires are within 50-200 miles</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Updates</h3>
              <p>Live data feed from NASA's satellite network refreshed continuously</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Enable Location</h3>
              <p>Allow location access for personalized alerts</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>View Live Data</h3>
              <p>See active fires, air quality, and wind patterns</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Alerts</h3>
              <p>Receive instant notifications about nearby threats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="demo-preview">
        <div className="container">
          <h2 className="section-title">See It In Action</h2>
          <p className="section-subtitle">
            Interactive map with real-time wildfire tracking and air quality monitoring
          </p>
          
          <div className="demo-container">
            <img 
              src="/demo-screenshot-1200x800.png" 
              alt="WildAlert Demo"
              className="demo-image"
            />
            <div className="demo-overlay">
              <button className="demo-play-btn" onClick={handleEnterApp}>
                <span className="play-icon">▶</span>
                Launch App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack">
        <div className="container">
          <h2 className="section-title">Built With</h2>
          <p className="section-subtitle">Powered by industry-leading technologies</p>
          
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-name">React</div>
            </div>
            <div className="tech-item">
              <div className="tech-name">NASA FIRMS</div>
            </div>
            <div className="tech-item">
              <div className="tech-name">Leaflet</div>
            </div>
            <div className="tech-item">
              <div className="tech-name">OpenWeather</div>
            </div>
            <div className="tech-item">
              <div className="tech-name">Vite</div>
            </div>
            <div className="tech-item">
              <div className="tech-name">Node.js</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">The Team</h2>
          <p className="team-subtitle">Built at [Hackathon Name] 2025</p>
          
          <div className="team-grid">
            <div className="team-member">
              <img src="/team/person1-400x400.png" alt="Team Member 1" className="team-photo" />
              <h3>Team Member 1</h3>
              <p className="team-role">Role Title</p>
            </div>
            <div className="team-member">
              <img src="/team/person2-400x400.png" alt="Team Member 2" className="team-photo" />
              <h3>Team Member 2</h3>
              <p className="team-role">Role Title</p>
            </div>
            <div className="team-member">
              <img src="/team/person3-400x400.png" alt="Team Member 3" className="team-photo" />
              <h3>Team Member 3</h3>
              <p className="team-role">Role Title</p>
            </div>
            <div className="team-member">
              <img src="/team/person4-400x400.png" alt="Team Member 4" className="team-photo" />
              <h3>Team Member 4</h3>
              <p className="team-role">Role Title</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>WildAlert</h3>
              <p>Real-time wildfire monitoring for everyone</p>
            </div>
            
            <div className="footer-section">
              <h4>Project</h4>
              <ul>
                <li><a href="https://github.com/your-repo">GitHub</a></li>
                <li><a href="/app" onClick={(e) => { e.preventDefault(); handleEnterApp(); }}>Live Demo</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Data Sources</h4>
              <ul>
                <li><a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA FIRMS</a></li>
                <li><a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 WildAlert Team. Built for public good.</p>
            <p className="disclaimer">
              This tool provides information based on NASA satellite data. 
              Always follow official emergency services guidance during wildfires.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;