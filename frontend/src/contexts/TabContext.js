import React, { createContext, useContext, useReducer } from 'react';

// Tab state management
const TAB_ACTIONS = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

const initialState = {
  activeTab: 'dashboard',
  loading: false,
  error: null,
  lastUpdated: Date.now()
};

// Reducer for predictable state updates
function tabReducer(state, action) {
  console.log(`🔄 TAB ACTION: ${action.type}`, action.payload);
  
  switch (action.type) {
    case TAB_ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
    
    case TAB_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case TAB_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
}

// Context creation
const TabContext = createContext();

// Provider component
export function TabProvider({ children }) {
  const [state, dispatch] = useReducer(tabReducer, initialState);
  
  // Action creators
  const setActiveTab = (tabName) => {
    console.log(`🎯 SETTING ACTIVE TAB: ${tabName}`);
    dispatch({ type: TAB_ACTIONS.SET_ACTIVE_TAB, payload: tabName });
  };
  
  const setLoading = (loading) => {
    dispatch({ type: TAB_ACTIONS.SET_LOADING, payload: loading });
  };
  
  const setError = (error) => {
    dispatch({ type: TAB_ACTIONS.SET_ERROR, payload: error });
  };
  
  const value = {
    ...state,
    setActiveTab,
    setLoading,
    setError
  };
  
  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

// Custom hook to use tab context
export function useTab() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
}

// Available tabs configuration
export const TAB_CONFIG = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview and statistics'
  },
  leads: {
    id: 'leads',
    label: 'Leads',
    icon: '🎯',
    description: 'Lead management and tracking'
  },
  pipeline: {
    id: 'pipeline',
    label: 'Pipeline',
    icon: '📈',
    description: 'Sales pipeline management'
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    icon: '✅',
    description: 'Task management and tracking'
  },
  erp: {
    id: 'erp',
    label: 'ERP',
    icon: '🏢',
    description: 'Business management and operations'
  },
  hrms: {
    id: 'hrms',
    label: 'HRMS',
    icon: '👥',
    description: 'Human resource management'
  },
  ai: {
    id: 'ai',
    label: 'AI',
    icon: '🤖',
    description: 'AI assistant and automation'
  },
  training: {
    id: 'training',
    label: 'Training',
    icon: '🎓',
    description: 'Comprehensive training modules and guides'
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    description: 'System administration'
  }
};

export { TAB_ACTIONS };