import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfflineSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch initial status
    fetchSyncStatus();
    
    // Set up periodic status updates
    const interval = setInterval(fetchSyncStatus, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [statusResponse, conflictsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/offline/sync-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/offline/conflicts?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setSyncStatus(statusResponse.data);
      setConflicts(conflictsResponse.data.conflicts || []);
      setLastSync(new Date().toISOString());

    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const resolveConflict = async (conflictId, resolution) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/offline/resolve-conflict/${conflictId}`,
        { resolution },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Refresh status after resolving conflict
      await fetchSyncStatus();
      alert('Conflict resolved successfully');

    } catch (error) {
      console.error('Error resolving conflict:', error);
      alert('Failed to resolve conflict');
    }
  };

  const queueOfflineOperation = async (operationData, entityType, operationType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/offline/queue`,
        {
          operation_data: operationData,
          entity_type: entityType,
          operation_type: operationType
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      await fetchSyncStatus();

    } catch (error) {
      console.error('Error queuing offline operation:', error);
      throw error;
    }
  };

  const autoSaveData = async (data, entityType, entityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/offline/autosave`,
        {
          data,
          entity_type: entityType,
          entity_id: entityId
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

    } catch (error) {
      console.error('Error auto-saving data:', error);
    }
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (!syncStatus) return 'text-gray-600';
    
    const pendingCount = syncStatus.status_breakdown?.pending || 0;
    const failedCount = syncStatus.status_breakdown?.failed || 0;
    
    if (failedCount > 0) return 'text-red-600';
    if (pendingCount > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSyncStatusIcon = () => {
    if (!isOnline) return '🔴';
    if (!syncStatus) return '⚪';
    
    const pendingCount = syncStatus.status_breakdown?.pending || 0;
    const failedCount = syncStatus.status_breakdown?.failed || 0;
    
    if (failedCount > 0) return '🔴';
    if (pendingCount > 0) return '🟡';
    if (syncStatus.is_syncing) return '🔄';
    return '🟢';
  };

  const getSyncStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!syncStatus) return 'Unknown';
    
    const pendingCount = syncStatus.status_breakdown?.pending || 0;
    const failedCount = syncStatus.status_breakdown?.failed || 0;
    
    if (failedCount > 0) return `${failedCount} Failed`;
    if (pendingCount > 0) return `${pendingCount} Pending`;
    if (syncStatus.is_syncing) return 'Syncing...';
    return 'Synced';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="offline-sync-status">
      {/* Compact Status Indicator */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getSyncStatusColor()}`}
        >
          <span className="text-base">{getSyncStatusIcon()}</span>
          <span>{getSyncStatusText()}</span>
        </button>

        {conflicts.length > 0 && (
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            {conflicts.length} Conflicts
          </div>
        )}
      </div>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sync Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Connection Status */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Connection:</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">Last Sync:</span>
                <span className="text-sm text-gray-600">{formatTime(lastSync)}</span>
              </div>
            </div>

            {/* Sync Statistics */}
            {syncStatus && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Operations</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-blue-800 font-medium">
                      {syncStatus.status_breakdown?.completed || 0}
                    </div>
                    <div className="text-blue-600 text-xs">Completed</div>
                  </div>
                  
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-yellow-800 font-medium">
                      {syncStatus.status_breakdown?.pending || 0}
                    </div>
                    <div className="text-yellow-600 text-xs">Pending</div>
                  </div>
                  
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-red-800 font-medium">
                      {syncStatus.status_breakdown?.failed || 0}
                    </div>
                    <div className="text-red-600 text-xs">Failed</div>
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-800 font-medium">
                      {syncStatus.total_operations || 0}
                    </div>
                    <div className="text-gray-600 text-xs">Total</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Conflicts */}
            {conflicts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Conflicts ({conflicts.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-red-800">
                            {conflict.entity_type} - {conflict.operation_type}
                          </div>
                          <div className="text-xs text-red-600">
                            {new Date(conflict.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => resolveConflict(conflict.id, 'use_offline')}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Use Local
                        </button>
                        
                        <button
                          onClick={() => resolveConflict(conflict.id, 'use_server')}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Use Server
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={fetchSyncStatus}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Status
              </button>
              
              {!isOnline && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium mb-1">Offline Mode Active</div>
                    <div className="text-xs">
                      Your changes are being saved locally and will sync when you're back online.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineSyncStatus;