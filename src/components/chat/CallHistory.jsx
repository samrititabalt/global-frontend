import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';
import api from '../../utils/axios';
import { format } from 'date-fns';

const CallHistory = ({ chatSessionId, currentUser }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatSessionId) {
      loadCallHistory();
    }
  }, [chatSessionId]);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/call/history/${chatSessionId}`);
      setCalls(response.data.calls || []);
    } catch (error) {
      console.error('Error loading call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (d.toDateString() === now.toDateString()) {
      return format(d, 'HH:mm');
    }
    return format(d, 'MMM d, HH:mm');
  };

  const getCallIcon = (call, userId) => {
    const isCaller = call.caller._id.toString() === userId.toString();
    
    if (call.status === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    
    return isCaller ? (
      <PhoneOutgoing className="w-4 h-4 text-blue-500" />
    ) : (
      <PhoneIncoming className="w-4 h-4 text-green-500" />
    );
  };

  const getCallLabel = (call, userId) => {
    const isCaller = call.caller._id.toString() === userId.toString();
    const otherUser = isCaller ? call.receiver : call.caller;
    
    if (call.status === 'missed') {
      return `Missed call from ${otherUser.name}`;
    }
    
    return isCaller 
      ? `You called ${otherUser.name}`
      : `${otherUser.name} called you`;
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading call history...
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No call history
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Call History</span>
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {calls.map((call) => (
          <div
            key={call._id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getCallIcon(call, currentUser?._id || currentUser?.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getCallLabel(call, currentUser?._id || currentUser?.id)}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    {call.duration > 0 && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(call.duration)}</span>
                      </span>
                    )}
                    <span>{formatDate(call.endedAt || call.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  call.status === 'ended' 
                    ? 'bg-green-100 text-green-800'
                    : call.status === 'missed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {call.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallHistory;
