import React, { useState, useEffect } from 'react';
import LogoLogin from '../assets/FinCat_login.png';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  Collapse,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { loginUser, userConfirmation } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Try to read `user` and `setUser` from outlet context (if provided)
  const outletCtx = useOutletContext() || {};
  const { user: ctxUser, setUser } = outletCtx;

  const location = useLocation();
  const signupMessage = location.state?.signupMessage ?? null;
  const [showSignupSuccess, setShowSignupSuccess] = useState(Boolean(signupMessage));

  // new UI state
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNavigateToSignUp = () => navigate('/signup');
  const handleNavigateToDashboard = () => navigate("/dashboard");

  // If the user is already present in context, redirect immediately.
  // Otherwise, try to confirm user via API (will use cookie or localStorage if available).
  useEffect(() => {
    let mounted = true;

    if (ctxUser) {
      // already logged in
      navigate('/dashboard', { replace: true });
      return;
    }

    const checkUser = async () => {
      try {
        const confirmed = await userConfirmation();
        if (!mounted) return;
        if (confirmed) {
          // set the user in context if setter is available, then redirect
          if (typeof setUser === 'function') setUser(confirmed);
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        // ignore — user not logged in
        // console.debug('userConfirmation failed', err);
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
    // Intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // new handler (handles form submit and Enter key)
  const handleSignIn = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setShowError(false);
    setErrorMsg("");
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      if (user) {
        if (typeof setUser === 'function') setUser(user);
        handleNavigateToDashboard();
      } else {
        setErrorMsg("Incorrect email or password.");
        setShowError(true);
      }
    } catch (err) {
      let msg = "Login failed. Please try again.";
      if (err?.response?.data) {
        msg = typeof err.response.data === "string"
          ? err.response.data
          : (err.response.data?.detail || JSON.stringify(err.response.data));
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 15 }}>
      <Collapse in={showSignupSuccess} sx={{ width: '100%', mb: 1 }}>
        <Alert severity="success" onClose={() => setShowSignupSuccess(false)}>
          {signupMessage}
        </Alert>
      </Collapse>

      {/* Wrap inputs in a form so Enter triggers onSubmit */}
      <Box
        component="form"
        onSubmit={handleSignIn}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <img src={LogoLogin} alt="Logo" style={{ marginBottom: theme.spacing(2), height: 60 }} />
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Sign in to FinCat
        </Typography>
        <Typography variant="h6" component="h4" align="center" gutterBottom>
          Welcome user, please sign in to continue
        </Typography>

        <Collapse in={showError} sx={{ width: '100%', mb: 1 }}>
          <Alert
            severity="error"
            onClose={() => setShowError(false)}
            sx={{ width: '100%' }}
            role="alert"
          >
            {errorMsg}
          </Alert>
        </Collapse>

        <TextField
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          autoComplete="current-password"
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
          {loading ? "Signing in..." : "Sign In With Email And Password"}
        </Button>

        <Button
          type="button"
          variant="text"
          color="secondary"
          onClick={handleNavigateToSignUp}
          sx={{ marginTop: theme.spacing(2) }}
        >
          No account? Sign up here
        </Button>
      </Box>
    </Paper>
  );
}
