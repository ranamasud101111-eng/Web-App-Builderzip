import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const DEFAULT = { classes: true, flashcards: true, shortnotes: true, qbank: true };

const ModuleSettingsContext = createContext({
  modules: DEFAULT,
  loading: true,
  refresh: () => {},
});

export const ModuleSettingsProvider = ({ children }) => {
  const [modules, setModules] = useState(DEFAULT);
  const [loading, setLoading]  = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/settings/modules');
      setModules(res.data);
    } catch {
      setModules(DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <ModuleSettingsContext.Provider value={{ modules, loading, refresh }}>
      {children}
    </ModuleSettingsContext.Provider>
  );
};

export const useModuleSettings = () => useContext(ModuleSettingsContext);
