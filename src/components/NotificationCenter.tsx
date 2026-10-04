import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Booking } from '../../shared/types';

interface NotificationCenterProps {
  booking: Booking | null;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ booking }) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!booking) return;

    // Simulate triggers
    const triggerNotifications = () => {
      const newAlerts = [];
      const now = new Date();
      const dep = new Date(booking.departureTime);
      const diffMs = dep.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs > 0 && diffHrs < 3) {
        newAlerts.push(`Boarding starts soon for ${booking.sourceCity} to ${booking.destCity}.`);
        if (Notification.permission === 'granted') {
          new Notification('Boarding Alert', { body: newAlerts[0] });
        }
      }
      
      // Mock gate change
      if (diffHrs > 0 && diffHrs < 1) {
        newAlerts.push('Gate change: Your boarding gate is now Bay 5.');
        if (Notification.permission === 'granted') {
          new Notification('Gate Change', { body: newAlerts[newAlerts.length - 1] });
        }
      }

      setNotifications(newAlerts);
    };

    const timer = setInterval(triggerNotifications, 10000); // Check every 10s
    triggerNotifications();
    return () => clearInterval(timer);
  }, [booking]);

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center space-x-2 text-[#E7CB58]">
        <Bell className="w-5 h-5" />
        <h3 className="font-display font-bold">Notification Center</h3>
      </div>
      
      {notifications.length === 0 ? (
        <p className="text-xs text-gray-400">No active alerts.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start space-x-2 text-xs text-white p-2 bg-black/40 rounded-lg border border-white/5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
