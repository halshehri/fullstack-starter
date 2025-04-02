import { useEffect, useState } from 'react';
import axios from 'axios';

// 💡 Define known API endpoints for each environment
const ENV_OPTIONS = {
  production: typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '/api',
  staging: 'https://your-staging-backend.up.railway.app/api',
  dev: 'http://localhost:3000/api',
};

const getOverrideEnv = () => localStorage.getItem('ENV_OVERRIDE') || (typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : 'production');
const getApiBaseUrl = () => ENV_OPTIONS[getOverrideEnv()] || ENV_OPTIONS.production;

function App() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [envVisible, setEnvVisible] = useState(false);
  const [overrideEnv, setOverrideEnv] = useState(getOverrideEnv());
  const API_BASE_URL = getApiBaseUrl();

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/calls`);
      console.log(`[${overrideEnv}] calls from API:`, response.data);
      if (Array.isArray(response.data)) {
        setCalls(response.data);
      } else {
        console.warn('Expected array, got:', typeof response.data);
        setCalls([]);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const logNewCall = async () => {
    try {
      setLogging(true);
      await axios.post(`${API_BASE_URL}/calls`);
      setSuccessMessage('New timestamp logged successfully ✅');
      await fetchCalls();
    } catch (error) {
      console.error('Error logging call:', error);
    } finally {
      setLogging(false);
    }
  };

  // Toggle the secret env switcher with Ctrl + E
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        setEnvVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [API_BASE_URL]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      {/* 🔐 Hidden Dev Environment Switcher */}
      {envVisible && (
        <div style={{
          background: '#cffafe',
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
        }}>
          <strong>Env Override:</strong>
          <select
            value={overrideEnv}
            onChange={(e) => {
              const selectedEnv = e.target.value;
              localStorage.setItem('ENV_OVERRIDE', selectedEnv);
              setOverrideEnv(selectedEnv);
              window.location.reload(); // reload app to reapply env
            }}
          >
            {Object.keys(ENV_OPTIONS).map((env) => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>
      )}

      {/* 🔖 Normal environment banner */}
      {overrideEnv !== 'production' && (
        <div
          style={{
            background: '#ffe58f',
            color: '#333',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          🚧 This is a <span style={{ textTransform: 'uppercase' }}>{overrideEnv}</span> environment
        </div>
      )}

      <h2>📞 Last 5 Call Timestamps</h2>

      {loading ? (
        <p>Loading...</p>
      ) : Array.isArray(calls) && calls.length > 0 ? (
        <ul>
          {calls.map((call) => (
            <li key={call.id}>
              {new Date(call.call_timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No calls yet.</p>
      )}

      <button onClick={logNewCall} disabled={logging} style={{ marginTop: '1rem' }}>
        {logging ? 'Logging...' : 'Log New Call'}
      </button>

      {successMessage && (
        <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
      )}
    </div>
  );
}

export default App;
