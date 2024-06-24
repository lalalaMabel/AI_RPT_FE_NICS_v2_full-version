// Component Imports
import UserList from '@views/apps/systemprompt/list'
import { UserDataProvider } from '@/contexts/userDataContext';

// const getData = async () => {
//   // const res = await fetch(`${process.env.API_URL2}/apps/user-list`)
//   // const response  = await fetch(`${process.env.API_URL2}/role`, {
//   const response  = await fetch(`http://192.168.1.196:7001/api/role`, {
//     method: 'GET'
//   })

//   if (!response .ok) {
//     throw new Error('Failed to fetch userData')
//   }

//   const res = await response.json();

//   if (res.status !== 'ok') {
//     throw new Error('Failed to fetch userData');
//   }

//   return res.data
// }

const UserListApp = async () => {
  // // Vars
  // const data = await getData()

  return (
    <UserDataProvider>
      <UserList />
    </UserDataProvider>
  );
}

export default UserListApp
