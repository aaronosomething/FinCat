import { useEffect, useState } from 'react'
import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Navbar from './components/NavBar';
import { Box } from '@mui/material';
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { api } from './api';

const drawerWidth = 90;

function App({mode, setMode}) {
  const [user, setUser] = useState(useLoaderData);
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (user) {
  //     navigate('/dashboard');
  //   }
  // })
  const contextObj = {user, setUser}

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar user={user} setUser={setUser} mode={mode} setMode={setMode} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Outlet context = {contextObj}/>
      </Box>
    </Box>
  );
}

export default App;