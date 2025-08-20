import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Button, Paper } from '@mui/material';
import FinCatDemo from '../assets/FinCat_Demo.jpg';

export default function HomePage() {
  const navigate = useNavigate();
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        backgroundImage: `url(${FinCatDemo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white' }}>
        <Typography variant='h2'>Welcome to FinCat!</Typography>
        <br />
        <Typography variant='h4'>Need an Account?
          <Button
            onClick={handleNavigateToSignup}
            variant="contained"
            sx={{
              height: 40,
              flexShrink: 0,
              ml: 3,
            }}
          >
            Sign Up Here!
          </Button>
        </Typography>
        <br />
        <Typography variant='h4'>Already Have One?
          <Button
            onClick={handleNavigateToLogin}
            variant="contained"
            sx={{
              height: 40,
              flexShrink: 0,
              ml: 3,
            }}
          >
            Log In
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}
