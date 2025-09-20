/**
 * Autosave Utility for Aavana Greens
 * Handles automatic saving of form data to IndexedDB every 10 seconds
 */

import axios from 'axios';

class AutoSaveManager {
  constructor() {
    this.db = null;
    this.saveInterval = 10000; // 10 seconds
    this.activeTimers = new Map();
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AavanaGreensAutosave', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('drafts')) {
          const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftStore.createIndex('entityType', 'entityType', { unique: false });
          draftStore.createIndex('userId', 'userId', { unique: false });
          draftStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Start autosaving for a form
   * @param {string} entityType - Type of entity (lead, task, target, etc.)
   * @param {string} entityId - Unique ID for the entity
   * @param {Function} getFormData - Function that returns current form data
   * @param {string} userId - Current user ID
   */
  startAutosave(entityType, entityId, getFormData, userId) {
    const key = `${entityType}_${entityId}`;
    
    // Clear existing timer if any
    this.stopAutosave(key);
    
    // Set up new timer
    const timer = setInterval(async () => {
      try {
        const formData = getFormData();
        if (formData && Object.keys(formData).length > 0) {
          await this.saveDraft(entityType, entityId, formData, userId);
        }
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, this.saveInterval);
    
    this.activeTimers.set(key, timer);
    console.log(`Autosave started for ${key}`);
  }

  /**
   * Stop autosaving for a form
   * @param {string} key - The autosave key
   */
  stopAutosave(key) {
    const timer = this.activeTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(key);
      console.log(`Autosave stopped for ${key}`);
    }
  }

  /**
   * Save draft to IndexedDB
   * @param {string} entityType - Type of entity
   * @param {string} entityId - Entity ID
   * @param {Object} data - Form data to save
   * @param {string} userId - User ID
   */
  async saveDraft(entityType, entityId, data, userId) {
    if (!this.db) await this.initDB();
    
    const draft = {
      id: `${entityType}_${entityId}`,
      entityType,
      entityId,
      data,
      userId,
      timestamp: new Date().toISOString(),
      version: Date.now()
    };
    
    const transaction = this.db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    await store.put(draft);
    
    console.log('Draft saved:', draft.id);
    
    // Also try to sync to backend if online
    if (navigator.onLine) {
      try {
        await this.syncToBackend(draft);
      } catch (error) {
        console.log('Backend sync failed, keeping local draft:', error.message);
      }
    }
  }

  /**
   * Load draft from IndexedDB
   * @param {string} entityType - Type of entity
   * @param {string} entityId - Entity ID
   * @param {string} userId - User ID
   */
  async loadDraft(entityType, entityId, userId) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['drafts'], 'readonly');
    const store = transaction.objectStore('drafts');
    const draft = await store.get(`${entityType}_${entityId}`);
    
    if (draft && draft.userId === userId) {
      console.log('Draft loaded:', draft.id);
      return draft;
    }
    
    return null;
  }

  /**
   * Delete draft from IndexedDB
   * @param {string} entityType - Type of entity
   * @param {string} entityId - Entity ID
   */
  async deleteDraft(entityType, entityId) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    await store.delete(`${entityType}_${entityId}`);
    
    console.log('Draft deleted:', `${entityType}_${entityId}`);
  }

  /**
   * Sync draft to backend
   * @param {Object} draft - Draft object
   */
  async syncToBackend(draft) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    
    await axios.post(
      `${API_BASE_URL}/api/offline/autosave`,
      {
        data: draft.data,
        entity_type: draft.entityType,
        entity_id: draft.entityId
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
  }

  /**
   * Queue offline operation
   * @param {Object} operationData - Operation data
   * @param {string} entityType - Entity type
   * @param {string} operationType - Operation type (create, update, delete)
   * @param {string} userId - User ID
   */
  async queueOfflineOperation(operationData, entityType, operationType, userId) {
    if (!this.db) await this.initDB();
    
    const operation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operationData,
      entityType,
      operationType,
      userId,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    const transaction = this.db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    await store.put(operation);
    
    console.log('Operation queued for offline sync:', operation.id);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  /**
   * Process offline sync queue
   */
  async processSyncQueue() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    const index = store.index('status');
    const cursor = await index.openCursor('pending');
    
    const operations = [];
    if (cursor) {
      do {
        operations.push(cursor.value);
      } while (await cursor.continue());
    }
    
    for (const operation of operations) {
      try {
        await this.syncOperationToBackend(operation);
        
        // Mark as completed
        operation.status = 'completed';
        operation.syncedAt = new Date().toISOString();
        await store.put(operation);
        
      } catch (error) {
        console.error('Sync failed for operation:', operation.id, error);
        
        // Update retry count
        operation.retryCount += 1;
        operation.lastError = error.message;
        
        if (operation.retryCount >= 3) {
          operation.status = 'failed';
        }
        
        await store.put(operation);
      }
    }
  }

  /**
   * Sync individual operation to backend
   * @param {Object} operation - Operation to sync
   */
  async syncOperationToBackend(operation) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token');

    const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    
    await axios.post(
      `${API_BASE_URL}/api/offline/queue`,
      {
        operation_data: operation.operationData,
        entity_type: operation.entityType,
        operation_type: operation.operationType
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
  }

  /**
   * Get sync status
   */
  async getSyncStatus(userId) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['offline_queue'], 'readonly');
    const store = transaction.objectStore('offline_queue');
    
    const allOperations = [];
    const cursor = await store.openCursor();
    if (cursor) {
      do {
        if (cursor.value.userId === userId) {
          allOperations.push(cursor.value);
        }
      } while (await cursor.continue());
    }
    
    const statusCounts = allOperations.reduce((acc, op) => {
      acc[op.status] = (acc[op.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: allOperations.length,
      pending: statusCounts.pending || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0,
      oldestPending: allOperations
        .filter(op => op.status === 'pending')
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]?.timestamp
    };
  }

  /**
   * Clean up old drafts and completed operations
   */
  async cleanup() {
    if (!this.db) await this.initDB();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago
    
    // Clean up old drafts
    const draftTransaction = this.db.transaction(['drafts'], 'readwrite');
    const draftStore = draftTransaction.objectStore('drafts');
    const draftIndex = draftStore.index('timestamp');
    
    const draftCursor = await draftIndex.openCursor(IDBKeyRange.upperBound(cutoffDate.toISOString()));
    if (draftCursor) {
      do {
        await draftCursor.delete();
      } while (await draftCursor.continue());
    }
    
    // Clean up completed operations
    const queueTransaction = this.db.transaction(['offline_queue'], 'readwrite');
    const queueStore = queueTransaction.objectStore('offline_queue');
    const queueIndex = queueStore.index('status');
    
    const queueCursor = await queueIndex.openCursor('completed');
    if (queueCursor) {
      do {
        const operation = queueCursor.value;
        if (new Date(operation.timestamp) < cutoffDate) {
          await queueCursor.delete();
        }
      } while (await queueCursor.continue());
    }
    
    console.log('Cleanup completed');
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();

// Setup online/offline event listeners
window.addEventListener('online', () => {
  console.log('Back online, processing sync queue...');
  autoSaveManager.processSyncQueue();
});

window.addEventListener('offline', () => {
  console.log('Gone offline, autosave will continue locally');
});

// Setup periodic cleanup
setInterval(() => {
  autoSaveManager.cleanup();
}, 24 * 60 * 60 * 1000); // Once per day