import { useEffect, useState } from 'react'
import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Navbar from './components/NavBar';
import { Box } from '@mui/material';
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { api, userConfirmation } from './api';

const drawerWidth = 90;

function App({ mode, setMode }) {
  // If you have loader data from react-router you should CALL the hook:
  const loaderData = useLoaderData(); // <- call the hook
  const initialUser = loaderData?.user ?? null;

  const [user, setUser] = useState(initialUser);
  const [authChecked, setAuthChecked] = useState(Boolean(initialUser)); // don't show loader if loaderData provided

  useEffect(() => {
    let mounted = true;

    // If loader already gave us a user, skip the check. Otherwise request current user.
    if (!initialUser) {
      (async () => {
        const u = await userConfirmation();
        if (!mounted) return;
        setUser(u ? (u.username ?? u) : null); // adapt if user is string or object
        setAuthChecked(true);
      })();
    }

    return () => {
      mounted = false;
    };
  }, [initialUser]);

  // Avoid rendering the whole app while we don't know auth state (prevents flicker)
  if (!authChecked) return null; // or a small spinner

  const contextObj = { user, setUser };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar user={user} setUser={setUser} mode={mode} setMode={setMode} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: '100%',
        }}
      >
        <Outlet context={contextObj} />
      </Box>
    </Box>
  );
}

export default App;