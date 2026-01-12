import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit, X } from 'lucide-react';

// Create context for edit mode
const EditModeContext = createContext();

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    return { isEditMode: false, toggleEditMode: () => {} };
  }
  return context;
};

/**
 * EditModeProvider Component
 * Provides edit mode state to all child components
 */
export const EditModeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const value = {
    isEditMode: isAdmin ? isEditMode : false,
    toggleEditMode: isAdmin ? toggleEditMode : () => {},
    isAdmin,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

/**
 * EditModeToggle Component
 * Button to toggle edit mode (only visible to admins)
 */
const EditModeToggle = () => {
  const { isEditMode, toggleEditMode, isAdmin } = useEditMode();

  if (!isAdmin) {
    return null;
  }

  return (
    <button
      onClick={toggleEditMode}
      className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
        isEditMode
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      style={{ fontSize: '12px' }}
      title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    >
      {isEditMode ? (
        <>
          <X size={14} />
          <span>Exit Edit</span>
        </>
      ) : (
        <>
          <Edit size={14} />
          <span>Edit Page</span>
        </>
      )}
    </button>
  );
};

export default EditModeToggle;
