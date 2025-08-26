import React, { useState } from 'react';
import LogoLogin from '../assets/FinCat_login.png';
import { Box, Typography, Button, TextField, Paper, Alert, Collapse } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { registerUser } from "../api";
import { useTheme } from '@mui/material/styles';

export default function SignupPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useOutletContext();

  // UI state for alerts / loading
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const FRIENDLY_EMAIL_EXISTS =
    "A user with this email address already exists, please sign in instead.";

  const handleSignup = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMsg("");
    setLoading(true);

    try {
      const result = await registerUser(email, password);

      if (result?.ok) {
        // Successful creation: navigate to login and show success message there
        navigate('/login', { state: { signupMessage: 'New user created, please sign in' } });
        return;
      }

      // Normalize failure handling by code
      const code = result?.code ?? null;
      const errText = result?.error ?? "Signup failed. Please try again.";

      if (code === 'invalid_email') {
        setErrorMsg("Please enter a valid email address");
      } else if (code === 'email_exists') {
        setErrorMsg(FRIENDLY_EMAIL_EXISTS);
      } else {
        setErrorMsg(errText);
      }

      setShowError(true);
    } catch (unexpectedErr) {
      // Very defensive: registerUser should not throw, but handle it here just in case
      console.error("Unexpected signup error:", unexpectedErr);
      setErrorMsg("Signup failed. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 15 }}>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="center"
        onSubmit={handleSignup}
      >
        <img src={LogoLogin} alt="Logo" style={{ marginBottom: theme.spacing(2), height: 60 }} />
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Sign Up
        </Typography>
        <Typography variant="h6" component="h4" align="center" gutterBottom>
          Create an account to get started
        </Typography>

        <Collapse in={showError} sx={{ width: '100%', mb: 1 }}>
          <Alert severity="error" onClose={() => setShowError(false)} sx={{ width: '100%' }}>
            {errorMsg}
          </Alert>
        </Collapse>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: theme.spacing(2) }}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>

        <Button
          type="button"
          variant="text"
          color="secondary"
          fullWidth
          onClick={() => navigate('/login')}
          sx={{ marginTop: theme.spacing(2) }}
        >
          Already have an Account? Sign In here.
        </Button>
      </Box>
    </Paper>
  );
}
