// Service Worker for Persistent Task Notifications
const CACHE_NAME = 'aavana-greens-v1';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      image: data.image || '/favicon.ico',
      tag: data.tag || 'task-notification',
      renotify: true,
      requireInteraction: true, // Keep notification until user interacts
      persistent: true,
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete',
          icon: '/favicon.ico'
        },
        {
          action: 'view',
          title: 'View Task',
          icon: '/favicon.ico'
        }
      ],
      data: {
        taskId: data.taskId,
        taskTitle: data.title,
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === 'complete') {
    // Mark task as complete
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (let client of clientList) {
          client.postMessage({
            type: 'COMPLETE_TASK',
            taskId: data.taskId
          });
        }
      })
    );
  } else if (action === 'view' || !action) {
    // Open the app to view task
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Try to focus existing window
        for (let client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            client.postMessage({
              type: 'NAVIGATE_TO_TASK',
              taskId: data.taskId
            });
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(data.url || '/');
        }
      })
    );
  }
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event);
  
  if (event.tag === 'task-notification-sync') {
    event.waitUntil(checkAndSendTaskNotifications());
  }
});

// Check for pending tasks and send notifications
async function checkAndSendTaskNotifications() {
  try {
    // Get all pending tasks from IndexedDB or cache
    const pendingTasks = await getPendingTasks();
    
    pendingTasks.forEach(task => {
      if (shouldSendNotification(task)) {
        sendTaskNotification(task);
      }
    });
  } catch (error) {
    console.error('Error checking task notifications:', error);
  }
}

// Send task notification
function sendTaskNotification(task) {
  const options = {
    body: `Task "${task.title}" is ${task.status === 'overdue' ? 'overdue' : 'pending'}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `task-${task.id}`,
    renotify: true,
    requireInteraction: true,
    persistent: true,
    actions: [
      {
        action: 'complete',
        title: 'Mark Complete'
      },
      {
        action: 'view',
        title: 'View Task'
      }
    ],
    data: {
      taskId: task.id,
      taskTitle: task.title,
      url: '/?task=' + task.id
    }
  };

  self.registration.showNotification(
    `🔔 Task Reminder: ${task.title}`,
    options
  );
}

// Check if notification should be sent
function shouldSendNotification(task) {
  // Don't send notifications for completed tasks
  if (task.status === 'completed') {
    return false;
  }
  
  // Check if task is due or overdue
  const dueDate = new Date(task.due_date);
  const now = new Date();
  
  // Send notification if task is due within 24 hours or overdue
  const timeDiff = dueDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);
  
  return hoursDiff <= 24; // Send notification if due within 24 hours
}

// Get pending tasks from storage
async function getPendingTasks() {
  // This would typically fetch from IndexedDB or API
  // For now, return empty array - this will be populated by the main app
  return [];
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.type === 'CACHE_TASKS') {
    // Cache tasks for offline notifications
    cacheTasks(event.data.tasks);
  } else if (event.data.type === 'SEND_TASK_NOTIFICATION') {
    // Send immediate task notification
    sendTaskNotification(event.data.task);
  } else if (event.data.type === 'SEND_CATALOGUE_NOTIFICATION') {
    // Send catalogue upload notification
    sendCatalogueNotification(event.data.catalogue);
  }
});

// Send catalogue upload notification
function sendCatalogueNotification(catalogue) {
  const options = {
    body: `New catalogue "${catalogue.name}" has been uploaded`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'catalogue-upload',
    renotify: true,
    actions: [
      {
        action: 'view',
        title: 'View Catalogue'
      }
    ],
    data: {
      catalogueId: catalogue.id,
      catalogueName: catalogue.name,
      url: '/?catalogue=' + catalogue.id
    }
  };

  self.registration.showNotification(
    `📄 New Catalogue: ${catalogue.name}`,
    options
  );
}

// Cache tasks for offline access
async function cacheTasks(tasks) {
  try {
    // Store tasks in IndexedDB for offline access
    // This is a simplified version - in production, use proper IndexedDB operations
    console.log('Service Worker: Caching tasks', tasks.length);
  } catch (error) {
    console.error('Error caching tasks:', error);
  }
}