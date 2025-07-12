import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationAPI } from '../services/api';
import { Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ onClose, onUpdateCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      onClose();
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      onUpdateCount(prev => prev > 0 ? prev - 1 : 0);
    } catch (error) {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      onUpdateCount(0);
    } catch (error) {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    navigate(notification.link);
    onClose();
  };

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-3 flex justify-between items-center border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Bell className="mx-auto text-gray-400 w-12 h-12"/>
            <p className="mt-2 text-gray-600">You have no new notifications.</p>
          </div>
        ) : (
          <ul>
            {notifications.map(n => (
              <li key={n.id} className={`border-b border-gray-100 ${!n.is_read ? 'bg-primary-50' : ''}`}>
                <div
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-start space-x-3"
                >
                  {!n.is_read && <span className="mt-1 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>}
                  <div className={`flex-grow ${n.is_read ? 'ml-5' : ''}`}>
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.created_at))} ago</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {notifications.length > 0 && (
         <div className="p-2 border-t text-center">
            <button onClick={handleMarkAllAsRead} className="text-sm text-primary-600 hover:underline">
              Mark all as read
            </button>
          </div>
      )}
    </div>
  );
};

export default NotificationDropdown;