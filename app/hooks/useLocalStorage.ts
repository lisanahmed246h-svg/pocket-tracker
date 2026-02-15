// app/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';
import { AppData, AppMode } from '../types';

const defaultData: AppData = {
  personal: {
    currentMonth: null,
    monthHistory: [],
  },
  family: {
    groceryList: [],
    bills: [],
    members: [
      { id: '1', name: 'সদস্য ১' },
      { id: '2', name: 'সদস্য ২' },
    ],
  },
  mess: {
    members: [
      { id: '1', name: 'সদস্য ১', meals: 0, fixedCosts: 0 },
      { id: '2', name: 'সদস্য ২', meals: 0, fixedCosts: 0 },
    ],
    bazarEntries: [],
    totalMeals: 0,
    mealRate: 0,
  },
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}

export function useAppData(mode: AppMode) {
  const [appData, setAppData, isLoaded] = useLocalStorage<AppData>('pocket-tracker-data', defaultData);

  const updateModeData = <K extends keyof AppData>(modeData: AppData[K]) => {
    setAppData((prev: AppData) => ({
      ...prev,
      [mode]: modeData,
    }));
  };

  const getModeData = () => appData[mode];

  return {
    data: appData,
    modeData: getModeData(),
    updateModeData,
    setAppData,
    isLoaded,
  };
}