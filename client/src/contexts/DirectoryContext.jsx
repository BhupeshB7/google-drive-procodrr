// DirectoryContext.jsx
import React, { createContext, useContext } from 'react';
import { useDirectory } from '@/hooks/UseDirectory';

const DirectoryContext = createContext();

export const DirectoryProvider = ({ children, parentId }) => {
  const directoryData = useDirectory(parentId);
  
  return (
    <DirectoryContext.Provider value={directoryData}>
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectoryContext = () => {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error('useDirectoryContext must be used within a DirectoryProvider');
  }
  return context;
};