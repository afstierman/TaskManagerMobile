import React, { createContext, useContext, useCallback, useState } from 'react';

interface TasksRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const TasksRefreshContext = createContext<TasksRefreshContextType>({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const TasksRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <TasksRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </TasksRefreshContext.Provider>
  );
};

export const useTasksRefresh = () => useContext(TasksRefreshContext);
