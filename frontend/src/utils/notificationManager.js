// Notification Manager for Persistent Task Notifications
class NotificationManager {
  constructor() {
    this.serviceWorker = null;
    this.notificationPermission = 'default';
    this.isOnline = navigator.onLine;
    this.pendingTasks = [];
    this.init();
  }

  async init() {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration;
        console.log('✅ Service Worker registered successfully');

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      }

      // Request notification permission
      await this.requestNotificationPermission();

      // Setup online/offline event listeners
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingNotifications();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Setup periodic task checking
      this.setupPeriodicTaskCheck();

    } catch (error) {
      console.error('❌ Error initializing NotificationManager:', error);
    }
  }

  async requestNotificationPermission() {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.notificationPermission = permission;
        
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          return true;
        } else if (permission === 'denied') {
          console.warn('❌ Notification permission denied');
          // Show fallback UI notification
          this.showFallbackNotification('Task notifications are disabled. Enable them in browser settings for better experience.');
          return false;
        } else {
          console.warn('⚠️ Notification permission not determined');
          return false;
        }
      } else {
        console.warn('❌ Notifications not supported in this browser');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Send task notification (mandatory, cannot be disabled by user)
  async sendTaskNotification(task) {
    try {
      if (task.status === 'completed') {
        // Don't send notifications for completed tasks
        return;
      }

      const notificationData = {
        title: `🔔 Task Reminder: ${task.title}`,
        body: this.getTaskNotificationBody(task),
        taskId: task.id,
        tag: `task-${task.id}`,
        image: '/favicon.ico',
        url: `/?task=${task.id}`
      };

      if (this.notificationPermission === 'granted' && this.serviceWorker) {
        // Send via service worker for persistent notifications
        await this.serviceWorker.active?.postMessage({
          type: 'SEND_TASK_NOTIFICATION',
          task: notificationData
        });
      } else {
        // Fallback to browser notification
        if ('Notification' in window && this.notificationPermission === 'granted') {
          const notification = new Notification(notificationData.title, {
            body: notificationData.body,
            icon: '/favicon.ico',
            tag: notificationData.tag,
            requireInteraction: true,
            actions: [
              { action: 'complete', title: 'Mark Complete' },
              { action: 'view', title: 'View Task' }
            ]
          });

          notification.onclick = () => {
            window.focus();
            this.navigateToTask(task.id);
            notification.close();
          };
        } else {
          // Final fallback - in-app notification
          this.showInAppTaskNotification(task);
        }
      }

      console.log(`📤 Task notification sent: ${task.title}`);
    } catch (error) {
      console.error('Error sending task notification:', error);
      // Always show fallback notification for critical tasks
      this.showInAppTaskNotification(task);
    }
  }

  // Send catalogue upload notification
  async sendCatalogueNotification(catalogue) {
    try {
      const notificationData = {
        title: `📄 New Catalogue: ${catalogue.name}`,
        body: `A new catalogue "${catalogue.name}" has been uploaded and is available for sharing.`,
        catalogueId: catalogue.id,
        tag: 'catalogue-upload',
        url: `/?catalogue=${catalogue.id}`
      };

      if (this.notificationPermission === 'granted' && this.serviceWorker) {
        await this.serviceWorker.active?.postMessage({
          type: 'SEND_CATALOGUE_NOTIFICATION',
          catalogue: notificationData
        });
      } else if ('Notification' in window && this.notificationPermission === 'granted') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: '/favicon.ico',
          tag: notificationData.tag
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } else {
        // Fallback to in-app notification
        this.showFallbackNotification(`📄 New catalogue: ${catalogue.name}`);
      }

      console.log(`📤 Catalogue notification sent: ${catalogue.name}`);
    } catch (error) {
      console.error('Error sending catalogue notification:', error);
    }
  }

  // Get appropriate notification body based on task status
  getTaskNotificationBody(task) {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return `This task is ${Math.abs(daysDiff)} day(s) overdue. Please complete it immediately.`;
    } else if (daysDiff === 0) {
      return `This task is due today. Priority: ${task.priority.toUpperCase()}`;
    } else if (daysDiff === 1) {
      return `This task is due tomorrow. Priority: ${task.priority.toUpperCase()}`;
    } else {
      return `This task is due in ${daysDiff} day(s). Priority: ${task.priority.toUpperCase()}`;
    }
  }

  // Setup periodic task checking (every 15 minutes)
  setupPeriodicTaskCheck() {
    setInterval(() => {
      this.checkAndNotifyTasks();
    }, 15 * 60 * 1000); // 15 minutes

    // Also check immediately
    setTimeout(() => {
      this.checkAndNotifyTasks();
    }, 5000); // Wait 5 seconds after app start
  }

  // Check tasks and send notifications for due/overdue tasks
  async checkAndNotifyTasks() {
    try {
      // Fetch current tasks from the app
      const tasks = await this.fetchCurrentTasks();
      
      tasks.forEach(task => {
        if (this.shouldNotifyForTask(task)) {
          this.sendTaskNotification(task);
        }
      });

      // Cache tasks for offline access
      if (this.serviceWorker) {
        this.serviceWorker.active?.postMessage({
          type: 'CACHE_TASKS',
          tasks: tasks
        });
      }
    } catch (error) {
      console.error('Error checking tasks for notifications:', error);
    }
  }

  // Determine if task needs notification
  shouldNotifyForTask(task) {
    if (task.status === 'completed') {
      return false;
    }

    const dueDate = new Date(task.due_date);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Notify for tasks due within 24 hours or overdue
    return hoursDiff <= 24;
  }

  // Fetch current tasks from app state or API
  async fetchCurrentTasks() {
    try {
      // Try to get tasks from global app state first
      if (window.appTasks && window.appTasks.length > 0) {
        return window.appTasks;
      }

      // Fallback to API call
      const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${API}/api/tasks`);
      
      if (response.ok) {
        const data = await response.json();
        return data.tasks || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching tasks for notifications:', error);
      return [];
    }
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(event) {
    const { type, taskId } = event.data;

    switch (type) {
      case 'COMPLETE_TASK':
        this.handleTaskCompletion(taskId);
        break;
      case 'NAVIGATE_TO_TASK':
        this.navigateToTask(taskId);
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  }

  // Handle task completion from notification
  handleTaskCompletion(taskId) {
    try {
      // Dispatch custom event for task completion
      window.dispatchEvent(new CustomEvent('taskCompleteFromNotification', {
        detail: { taskId }
      }));
      
      console.log(`✅ Task marked as complete from notification: ${taskId}`);
    } catch (error) {
      console.error('Error handling task completion:', error);
    }
  }

  // Navigate to specific task
  navigateToTask(taskId) {
    try {
      // Navigate to tasks tab and highlight specific task
      window.dispatchEvent(new CustomEvent('navigateToTask', {
        detail: { taskId }
      }));
      
      console.log(`🔍 Navigating to task: ${taskId}`);
    } catch (error) {
      console.error('Error navigating to task:', error);
    }
  }

  // Show in-app notification as fallback
  showInAppTaskNotification(task) {
    // Create floating notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-bold">🔔 Task Reminder</div>
          <div class="text-sm">${task.title}</div>
          <div class="text-xs mt-1">${this.getTaskNotificationBody(task)}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
      <div class="mt-2 flex space-x-2">
        <button onclick="window.dispatchEvent(new CustomEvent('taskCompleteFromNotification', {detail: {taskId: '${task.id}'}}))" 
                class="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs">
          Complete
        </button>
        <button onclick="window.dispatchEvent(new CustomEvent('navigateToTask', {detail: {taskId: '${task.id}'}}))" 
                class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">
          View Task
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Show fallback notification
  showFallbackNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="text-sm">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Sync pending notifications when back online
  syncPendingNotifications() {
    if (this.isOnline && this.serviceWorker) {
      this.serviceWorker.active?.postMessage({
        type: 'SYNC_NOTIFICATIONS'
      });
    }
  }

  // Force send notification for high priority tasks (cannot be disabled)
  forceSendTaskNotification(task) {
    if (task.priority === 'high' || task.status === 'overdue') {
      this.showInAppTaskNotification(task);
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;