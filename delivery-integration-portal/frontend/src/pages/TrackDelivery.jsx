import { useState } from 'react';
import api from '../services/api';

export default function TrackDelivery() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDelivery(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/track/${trackingNumber.trim()}`);
      setDelivery(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: 'bg-gray-100 text-gray-700',
    accepted: 'bg-blue-100 text-blue-700',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Track Your Delivery</h1>
        <p className="text-gray-500 text-center mb-8">Enter your tracking number to see the latest status.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 flex gap-3 mb-6">
          <input
            type="text"
            placeholder="e.g. 26152821"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
            required
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center text-red-500 text-sm">
            {error}
          </div>
        )}

        {delivery && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>
                <p className="font-bold text-lg">{delivery.tracking_number}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${statusColor[delivery.status] || 'bg-gray-100'}`}>
                {delivery.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">From</p>
                <p>{delivery.pickup_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">To</p>
                <p>{delivery.dropoff_address}</p>
                <p className="text-gray-500">{delivery.dropoff_contact_name}</p>
              </div>
            </div>

            {delivery.driver && (
              <div className="mb-6 text-sm">
                <p className="text-xs text-gray-500 mb-1">Driver</p>
                <p>{delivery.driver.name} — {delivery.driver.phone}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-3">Timeline</p>
              <div className="space-y-3">
                {delivery.timeline.map((event, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    <div className="flex-1 flex justify-between text-sm">
                      <span className="capitalize">{event.status.replace('_', ' ')}</span>
                      <span className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
