'use client';

import React from 'react';
// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { UsersType, RoleType } from '@/types/apps/userTypes'

// Component Imports
import UserListTable from './UserListTable'
import { useSysRoleData } from '@/contexts/userDataContext';

// const UserList = ({ userData }: { userData?: RoleType[] }) => {
const UserList = () => {
  const { sysRoleData } = useSysRoleData();

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserListTable tableData={sysRoleData} />
      </Grid>
    </Grid>
  )
}

export default UserList
