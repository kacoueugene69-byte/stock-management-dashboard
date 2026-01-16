
import React from 'react';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
