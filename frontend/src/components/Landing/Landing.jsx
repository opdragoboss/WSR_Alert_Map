import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function EmberCanvas() {
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const embers = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.7 - 0.2,
      a: Math.random() * 0.8 + 0.6
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const ember of embers) {
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${ember.a})`;
        ctx.fill();
        ember.x += ember.vx;
        ember.y += ember.vy;
        if (ember.y < -10) {
          ember.y = height + 10;
          ember.x = Math.random() * width;
        }
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="ember-canvas" />;
}

function Landing() {
  const navigate = useNavigate();
  const [activeFireCount] = React.useState(247);

  React.useEffect(() => {
    document.body.classList.add('landing-body');
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('landing-body');
    };
  }, []);

  const handleEnterApp = React.useCallback(() => {
    navigate('/app');
  }, [navigate]);

  return (
    <div className="landing-page">
      <section className="hero">
        <EmberCanvas />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-indicator" />
            Currently tracking {activeFireCount} active wildfires
          </div>

          <h1 className="hero-title">
            Get Wildfire Alerts
            <br />
            <span className="highlight">Before It&apos;s Too Late</span>
          </h1>

          <p className="hero-subtitle">
            Real-time wildfire monitoring powered by NASA data. Know what&apos;s happening around you in seconds, not
            hours.
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

      <section className="problem-section">
        <div className="container">
          <h2 className="section-title">The Problem</h2>
          <p className="section-subtitle">Every year, lives are lost because alerts arrive too late</p>

          <div className="problem-grid">
            <div className="stat-card">
              <div className="stat-number">85%</div>
              <p>of residents receive notices too late</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">2-4 hrs</div>
              <p>delay between detection and alerts</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <p>lives could be saved with earlier warnings</p>
            </div>
          </div>

          <p className="problem-text">
            California residents often get alerts when it&apos;s already time to evacuate.{' '}
            <strong>We give you hours, not minutes.</strong>
          </p>
        </div>
      </section>

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
              <p>Live data feed from NASA&apos;s satellite network refreshed continuously</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌡️</div>
              <h3>Weather Integration</h3>
              <p>Real-time wind direction and speed for smoke spread prediction</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Historical Data</h3>
              <p>Access historical wildfire trends to understand regional fire patterns</p>
            </div>
          </div>
        </div>
      </section>

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

      <section className="tech-stack">
        <div className="container">
          <h2 className="section-title">Built With</h2>
          <p className="section-subtitle">Powered by industry-leading technologies</p>

          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-logo-text">JS</div>
              <div className="tech-name">JavaScript</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original-wordmark.svg"
                alt="React"
                className="tech-logo"
              />
              <div className="tech-name">React</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg"
                alt="Node.js"
                className="tech-logo"
              />
              <div className="tech-name">Node.js</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original-wordmark.svg"
                alt="Express"
                className="tech-logo"
              />
              <div className="tech-name">Express</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original-wordmark.svg"
                alt="Tailwind CSS"
                className="tech-logo"
              />
              <div className="tech-name">Tailwind CSS</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/leaflet.svg"
                alt="Leaflet"
                className="tech-logo"
              />
              <div className="tech-name">Leaflet</div>
            </div>
            <div className="tech-item">
              <div className="tech-logo-text">🌤️</div>
              <div className="tech-name">OpenWeather</div>
            </div>
            <div className="tech-item">
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/nasa.svg"
                alt="NASA EONET"
                className="tech-logo"
              />
              <div className="tech-name">NASA EONET</div>
            </div>
          </div>
        </div>
      </section>

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
                <li>
                  <a href="https://github.com/your-repo">GitHub</a>
                </li>
                <li>
                  <a
                    href="/app"
                    onClick={(event) => {
                      event.preventDefault();
                      handleEnterApp();
                    }}
                  >
                    Live Demo
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Data Source</h4>
              <ul>
                <li>
                  <a href="https://eonet.gsfc.nasa.gov/api/v3" target="_blank" rel="noopener noreferrer">
                    EONET by NASA
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 UN x UCSC Hackathon Team. Built for public good.</p>
            <p className="disclaimer">
              This app is a work in progress and is not yet ready for production. This tool provides information based on
              NASA satellite data. Always follow official emergency services guidance during wildfires.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

