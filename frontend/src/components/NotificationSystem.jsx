import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, MessageCircle, Mail, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const NotificationSystem = ({ showTestingPanel = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false); // Keep closed by default
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize notification system
    initializeNotificationSystem();
    
    // Load demo notifications
    loadDemoNotifications();
    
    // Check for service worker
    checkServiceWorker();

    // Add click outside listener for notification panel
    const handleClickOutside = (event) => {
      if (isNotificationPanelOpen && !event.target.closest('.notification-system')) {
        setIsNotificationPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationPanelOpen]);

  const initializeNotificationSystem = async () => {
    // Check notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      console.log('Notification permission:', permission);
    }

    // Initialize audio for notification sounds
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  };

  const checkServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setServiceWorkerReady(true);
        console.log('Service Worker ready for push notifications');
      });
    }
  };

  const loadDemoNotifications = () => {
    const demoNotifications = [
      {
        id: '1',
        type: 'lead',
        title: 'New Lead Assigned',
        message: 'Rajesh Kumar - Premium Balcony Garden Project (₹75,000)',
        timestamp: new Date(),
        status: 'unread',
        priority: 'high',
        channel: ['push', 'whatsapp'],
        source: 'Lead Management'
      },
      {
        id: '2', 
        type: 'task',
        title: 'Task Due Soon',
        message: 'Follow up with Priya Sharma - Due in 2 hours',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'unread',
        priority: 'medium',
        channel: ['push', 'email'],
        source: 'Task Management'
      },
      {
        id: '3',
        type: 'hrms',
        title: 'Face Check-in Required',
        message: 'Please complete your daily check-in',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: 'read',
        priority: 'low',
        channel: ['push'],
        source: 'HRMS'
      },
      {
        id: '4',
        type: 'system',
        title: 'Bulk Upload Complete',
        message: '132 leads imported successfully, 18 duplicates detected',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read',
        priority: 'medium',
        channel: ['push', 'email'],
        source: 'System'
      },
      {
        id: '5',
        type: 'whatsapp',
        title: 'WhatsApp Message',
        message: 'Customer inquiry about garden maintenance services',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'unread',
        priority: 'high',
        channel: ['whatsapp', 'push'],
        source: 'WhatsApp Integration'
      }
    ];

    setNotifications(demoNotifications);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const showPushNotification = (notification) => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        actions: [
          { action: 'view', title: 'View', icon: '/icons/view.png' },
          { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
        ],
        data: notification
      };

      const pushNotification = new Notification(notification.title, options);
      
      pushNotification.onclick = () => {
        window.focus();
        setIsNotificationPanelOpen(true);
        pushNotification.close();
      };

      // Auto close after delay based on priority
      const autoCloseDelay = notification.priority === 'high' ? 10000 : 5000;
      setTimeout(() => pushNotification.close(), autoCloseDelay);
    }
  };

  const sendWhatsAppNotification = async (notification) => {
    // Simulate WhatsApp notification sending
    console.log('📱 Sending WhatsApp notification:', notification.title);
    
    // In real implementation, would call WhatsApp Business API
    const whatsappMessage = {
      to: '+919876543210', // User's WhatsApp number
      type: 'template',
      template: {
        name: 'notification_alert',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: notification.title },
              { type: 'text', text: notification.message }
            ]
          }
        ]
      }
    };

    // Mock API call
    setTimeout(() => {
      console.log('✅ WhatsApp notification sent successfully');
      addSystemNotification({
        type: 'system',
        title: 'WhatsApp Sent',
        message: `Notification sent via WhatsApp: ${notification.title}`,
        priority: 'low'
      });
    }, 1000);
  };

  const sendEmailNotification = async (notification) => {
    // Simulate email notification sending
    console.log('📧 Sending email notification:', notification.title);
    
    const emailData = {
      to: 'user@aavana-greens.com',
      subject: `Aavana Greens - ${notification.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1>🌱 Aavana Greens CRM</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #059669;">${notification.title}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">${notification.message}</p>
            <div style="margin: 20px 0; padding: 15px; background: #ecfdf5; border-left: 4px solid #10b981;">
              <strong>Source:</strong> ${notification.source}<br>
              <strong>Priority:</strong> ${notification.priority.toUpperCase()}<br>
              <strong>Time:</strong> ${notification.timestamp.toLocaleString()}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://app.aavana-greens.com" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Open Aavana Greens CRM
              </a>
            </div>
          </div>
          <div style="padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            © 2024 Aavana Greens. All rights reserved.
          </div>
        </div>
      `
    };

    // Mock API call
    setTimeout(() => {
      console.log('✅ Email notification sent successfully');
      addSystemNotification({
        type: 'system',
        title: 'Email Sent',
        message: `Email notification sent: ${notification.title}`,
        priority: 'low'
      });
    }, 1500);
  };

  const addSystemNotification = (notificationData) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'unread',
      channel: ['push'],
      ...notificationData
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const sendNotification = (notificationData) => {
    const notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'unread',
      ...notificationData
    };

    // Add to notification list
    setNotifications(prev => [notification, ...prev]);

    // Play sound
    playNotificationSound();

    // Send via enabled channels
    if (notification.channel.includes('push')) {
      showPushNotification(notification);
    }

    if (notification.channel.includes('whatsapp')) {
      sendWhatsAppNotification(notification);
    }

    if (notification.channel.includes('email')) {
      sendEmailNotification(notification);
    }

    return notification;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, status: 'read' } : n
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lead': return '👤';
      case 'task': return '✅';
      case 'hrms': return '👔';
      case 'system': return '⚙️';
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="notification-system">
      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>

      {/* Notification Bell Icon */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {isNotificationPanelOpen && (
          <>
            {/* Backdrop overlay to close panel */}
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsNotificationPanelOpen(false)}
            />
            <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex space-x-2">
                    {notifications.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNotificationPanelOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          notification.status === 'unread' ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleString()}
                              </p>
                              <div className="flex space-x-1">
                                {notification.channel.map((channel) => (
                                  <span key={channel} className="text-xs text-gray-400">
                                    {channel === 'push' && '📱'}
                                    {channel === 'whatsapp' && '💬'}
                                    {channel === 'email' && '📧'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notification Testing Panel - Only show when requested */}
      {showTestingPanel && (
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 Notification System Testing
          </CardTitle>
          <CardDescription>
            Test all notification channels and verify delivery across push, WhatsApp, and email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Push Notification Test */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Push Notifications</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Browser push notifications with sound alerts
              </p>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`${
                    notificationPermission === 'granted' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {notificationPermission}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Service Worker:</span>{' '}
                  <span className={`${serviceWorkerReady ? 'text-green-600' : 'text-yellow-600'}`}>
                    {serviceWorkerReady ? 'Ready' : 'Loading'}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-3"
                onClick={() => sendNotification({
                  type: 'system',
                  title: 'Push Test',
                  message: 'This is a test push notification!',
                  priority: 'medium',
                  channel: ['push'],
                  source: 'Notification Test'
                })}
              >
                Test Push
              </Button>
            </div>

            {/* WhatsApp Notification Test */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">WhatsApp</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                WhatsApp Business API integration
              </p>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">API:</span>{' '}
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Templates:</span>{' '}
                  <span className="text-green-600">5 Active</span>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-3 bg-green-600 hover:bg-green-700"
                onClick={() => sendNotification({
                  type: 'whatsapp',
                  title: 'WhatsApp Test',
                  message: 'Test WhatsApp notification sent successfully!',
                  priority: 'high',
                  channel: ['whatsapp', 'push'],
                  source: 'WhatsApp Test'
                })}
              >
                Test WhatsApp
              </Button>
            </div>

            {/* Email Notification Test */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Email</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                SMTP email notifications with templates
              </p>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">SMTP:</span>{' '}
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Templates:</span>{' '}
                  <span className="text-green-600">8 Active</span>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                onClick={() => sendNotification({
                  type: 'email',
                  title: 'Email Test',
                  message: 'Test email notification with HTML template!',
                  priority: 'medium',
                  channel: ['email', 'push'],
                  source: 'Email Test'
                })}
              >
                Test Email
              </Button>
            </div>
          </div>

          {/* Multi-Channel Test */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">🚀 Multi-Channel Test</h4>
            <p className="text-sm text-gray-600 mb-4">
              Send test notification across all channels simultaneously
            </p>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => sendNotification({
                type: 'system',
                title: 'Multi-Channel Test',
                message: 'This notification was sent via Push + WhatsApp + Email!',
                priority: 'high',
                channel: ['push', 'whatsapp', 'email'],
                source: 'Multi-Channel Test'
              })}
            >
              Test All Channels
            </Button>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default NotificationSystem;