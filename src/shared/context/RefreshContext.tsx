import { createContext, useCallback, useContext, useState } from "react";

interface RefreshContextValue {
  /** Increments whenever data changes somewhere that other views should reflect. */
  dataVersion: number;
  /** Call after creating/updating data to signal dependent views to refetch. */
  notifyChange: () => void;
}

const RefreshContext = createContext<RefreshContextValue>({
  dataVersion: 0,
  notifyChange: () => {},
});

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [dataVersion, setDataVersion] = useState(0);
  const notifyChange = useCallback(() => setDataVersion((v) => v + 1), []);
  return (
    <RefreshContext.Provider value={{ dataVersion, notifyChange }}>
      {children}
    </RefreshContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRefresh = () => useContext(RefreshContext);
