import React from 'react';
import LogoLogin from '../assets/FinCat_login.png';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { Email, Light, Password, Title } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { loginUser } from '../api';


export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useOutletContext();


  const handleNavigateToSignUp = () => {
    navigate('/signup');
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };



  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 15}}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <img src={LogoLogin} alt="Logo" style={{ marginBottom: theme.spacing(2), height: 60 }} />
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Sign in to FinCat
        </Typography>
        <Typography variant="h6" component="h4" align="center" gutterBottom>
          Welcome user, please sign in to continue
        </Typography>
        <TextField
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
        />
        <TextField
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={async (e) => [
            e.preventDefault(),
            setUser(await loginUser(email, password)),
            handleNavigateToDashboard(),
          ]}
          sx={{ marginTop: theme.spacing(2) }}
        >
          Sign In With Email And Password
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={handleNavigateToSignUp}
          sx={{ marginTop: theme.spacing(2) }}
        >
          No account? Sign up here
        </Button>
      </Box>
    </Paper>

  )
}