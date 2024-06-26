'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RoleType } from '@/types/apps/userTypes';

interface UserDataContextProps {
  sysRoleData: RoleType[];
  fetchSysRoleData: () => void;
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [sysRoleData, setSysRoleData] = useState<RoleType[]>([]);

  const fetchSysRoleData = async () => {
    try {
      // const response  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`, { method: 'GET' });
      const response  = await fetch(`http://192.168.1.196:7001/api/role`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch sysRoleData');
      }
      const res = await response.json();
      if (res.status !== 'ok') {
        throw new Error('Failed to fetch sysRoleData');
      }
      setSysRoleData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchSysRoleData();
  }, []);

  return (
      <UserDataContext.Provider value={{ sysRoleData, fetchSysRoleData }}>
        {children}
      </UserDataContext.Provider>
  );
};

export const useSysRoleData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useSysRoleData must be used within a UserDataProvider');
  }
  return context;
};
