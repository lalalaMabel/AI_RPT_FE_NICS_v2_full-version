'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RoleType } from '@/types/apps/userTypes';

interface UserDataContextProps {
  userData: RoleType[];
  fetchUserData: () => void;
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<RoleType[]>([]);

  const fetchUserData = async () => {
    try {
      const response  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`, { method: 'GET' });
      // const response = await fetch(`${process.env.API_URL2}/role`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch userData');
      }
      const res = await response.json();
      if (res.status !== 'ok') {
        throw new Error('Failed to fetch userData');
      }
      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
      <UserDataContext.Provider value={{ userData, fetchUserData }}>
        {children}
      </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
