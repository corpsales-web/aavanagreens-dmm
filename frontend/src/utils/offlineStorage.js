// Offline Storage Utility for Gallery and Catalogue
// Uses localStorage and IndexedDB for data persistence

class OfflineStorage {
  constructor() {
    this.dbName = 'AavanaGreensOfflineDB';
    this.dbVersion = 1;
    this.db = null;
    this.initDB();
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Gallery store
        if (!db.objectStoreNames.contains('gallery')) {
          const galleryStore = db.createObjectStore('gallery', { keyPath: 'id' });
          galleryStore.createIndex('projectId', 'projectId', { unique: false });
          galleryStore.createIndex('category', 'category', { unique: false });
        }
        
        // Catalogue store
        if (!db.objectStoreNames.contains('catalogue')) {
          const catalogueStore = db.createObjectStore('catalogue', { keyPath: 'id' });
          catalogueStore.createIndex('category', 'category', { unique: false });
        }
        
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        
        // Offline queue for sync when online
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Check if browser is online
  isOnline() {
    return navigator.onLine;
  }

  // Store gallery data for offline use
  async storeGalleryData(projectId, images) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['gallery'], 'readwrite');
    const store = transaction.objectStore('gallery');
    
    for (const image of images) {
      const galleryItem = {
        ...image,
        projectId,
        cachedAt: new Date().toISOString(),
        offlineAvailable: true
      };
      await store.put(galleryItem);
    }
    
    console.log(`📱 Stored ${images.length} gallery images for offline use`);
  }

  // Store catalogue data for offline use
  async storeCatalogueData(catalogueItems) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['catalogue'], 'readwrite');
    const store = transaction.objectStore('catalogue');
    
    for (const item of catalogueItems) {
      const catalogueItem = {
        ...item,
        cachedAt: new Date().toISOString(),
        offlineAvailable: true
      };
      await store.put(catalogueItem);
    }
    
    console.log(`📱 Stored ${catalogueItems.length} catalogue items for offline use`);
  }

  // Store projects data
  async storeProjects(projects) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    for (const project of projects) {
      const projectData = {
        ...project,
        cachedAt: new Date().toISOString(),
        offlineAvailable: true
      };
      await store.put(projectData);
    }
    
    console.log(`📱 Stored ${projects.length} projects for offline use`);
  }

  // Get gallery data (offline first)
  async getGalleryData(projectId = null) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['gallery'], 'readonly');
    const store = transaction.objectStore('gallery');
    
    if (projectId) {
      const index = store.index('projectId');
      return new Promise((resolve, reject) => {
        const request = index.getAll(projectId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Get catalogue data (offline first)
  async getCatalogueData(category = null) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['catalogue'], 'readonly');
    const store = transaction.objectStore('catalogue');
    
    if (category) {
      const index = store.index('category');
      return new Promise((resolve, reject) => {
        const request = index.getAll(category);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Get projects data
  async getProjects() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Queue action for when online
  async queueAction(action, data) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    const queueItem = {
      action,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    await store.add(queueItem);
    console.log('📥 Queued action for sync:', action);
  }

  // Process offline queue when online
  async processOfflineQueue() {
    if (!this.isOnline() || !this.db) return;
    
    const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        const queueItems = request.result.filter(item => item.status === 'pending');
        
        for (const item of queueItems) {
          try {
            // Process each queued action
            await this.processQueueItem(item);
            
            // Mark as processed
            item.status = 'processed';
            item.processedAt = new Date().toISOString();
            await store.put(item);
            
          } catch (error) {
            console.error('Error processing queue item:', error);
            item.status = 'failed';
            item.error = error.message;
            await store.put(item);
          }
        }
        
        console.log(`✅ Processed ${queueItems.length} offline queue items`);
        resolve(queueItems.length);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Process individual queue item
  async processQueueItem(item) {
    const { action, data } = item;
    
    switch (action) {
      case 'batch_send_gallery':
        // Call API to send gallery batch
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/batch-send/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Batch send failed');
        break;
        
      case 'batch_send_catalogue':
        // Call API to send catalogue batch
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/batch-send/catalogue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
        
      default:
        console.warn('Unknown action in queue:', action);
    }
  }

  // Clear cached data (maintenance)
  async clearCache(type = null) {
    if (!this.db) await this.initDB();
    
    const stores = type ? [type] : ['gallery', 'catalogue', 'projects'];
    const transaction = this.db.transaction(stores, 'readwrite');
    
    for (const storeName of stores) {
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
    console.log(`🗑️ Cleared cache for: ${stores.join(', ')}`);
  }

  // Get storage usage statistics
  async getStorageStats() {
    if (!this.db) await this.initDB();
    
    const stats = {
      gallery: 0,
      catalogue: 0,
      projects: 0,
      queueItems: 0
    };
    
    const transaction = this.db.transaction(['gallery', 'catalogue', 'projects', 'offlineQueue'], 'readonly');
    
    // Count items in each store
    for (const storeName of Object.keys(stats)) {
      const store = transaction.objectStore(storeName === 'queueItems' ? 'offlineQueue' : storeName);
      stats[storeName] = await new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
      });
    }
    
    return stats;
  }

  // Enable/disable offline mode
  setOfflineMode(enabled) {
    localStorage.setItem('offlineModeEnabled', enabled.toString());
    console.log(`📱 Offline mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isOfflineModeEnabled() {
    return localStorage.getItem('offlineModeEnabled') === 'true';
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Listen for online/offline events
window.addEventListener('online', async () => {
  console.log('🌐 Connection restored - processing offline queue');
  try {
    await offlineStorage.processOfflineQueue();
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
});

window.addEventListener('offline', () => {
  console.log('📵 Connection lost - switching to offline mode');
});

export default offlineStorage;