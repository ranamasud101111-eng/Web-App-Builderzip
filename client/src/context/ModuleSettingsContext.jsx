import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

const DEFAULT = { classes: true, flashcards: true, shortnotes: true, qbank: true };
const POLL_INTERVAL = 30000;

const ModuleSettingsContext = createContext({
  modules: DEFAULT,
  loading: true,
  refresh: () => {},
});

export const ModuleSettingsProvider = ({ children }) => {
  const [modules, setModules] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const location = useLocation();

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

  useEffect(() => { refresh(); }, [location.pathname, refresh]);

  useEffect(() => {
    timerRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  return (
    <ModuleSettingsContext.Provider value={{ modules, loading, refresh }}>
      {children}
    </ModuleSettingsContext.Provider>
  );
};

export const useModuleSettings = () => useContext(ModuleSettingsContext);
