import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchCoins, createCoin, deleteCoin } from '../api/coins';
import { useAuth } from './AuthContext';

const CoinsContext = createContext(null);

export function CoinsProvider({ children }) {
  const { session } = useAuth();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setCoins([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCoins(await fetchCoins());
    } catch (e) {
      setError(e.message || 'Could not load your collection');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCoin = async (scan, base64Photo) => {
    const row = await createCoin(scan, base64Photo);
    setCoins((prev) => [row, ...prev]);
    return row;
  };

  const removeCoin = async (id) => {
    await deleteCoin(id);
    setCoins((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CoinsContext.Provider
      value={{ coins, loading, error, refresh, addCoin, removeCoin }}
    >
      {children}
    </CoinsContext.Provider>
  );
}

export const useCoins = () => useContext(CoinsContext);
