import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function App() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/calls`);
      console.log('calls from API:', response.data);
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

  useEffect(() => {
    fetchCalls();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
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
