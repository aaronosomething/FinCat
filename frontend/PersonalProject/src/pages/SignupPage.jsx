// import React, { useState } from 'react';
// import LogoLogin from '../assets/FinCat_login.png';
// import { Box, Typography, Button, TextField, Paper, Alert, Collapse } from '@mui/material';
// import { useNavigate, useOutletContext } from 'react-router-dom';
// import { registerUser } from "../api";
// import { useTheme } from '@mui/material/styles';

// export default function SignupPage() {
//   const navigate = useNavigate();
//   const theme = useTheme();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { setUser } = useOutletContext();

//   // UI state for alerts / loading
//   const [errorMsg, setErrorMsg] = useState("");
//   const [showError, setShowError] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const FRIENDLY_EMAIL_EXISTS =
//     "A user with this email address already exists, please sign in instead.";

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setShowError(false);
//     setErrorMsg("");
//     setLoading(true);

//     try {
//       const user = await registerUser(email, password);

//       if (user) {
//         // On successful creation: navigate to login page and show a friendly message there
//         navigate('/login', { state: { signupMessage: 'New user created, please sign in' } });
//         return;
//       }

//       // registerUser returned null (unexpected) -> generic fallback
//       setErrorMsg("Signup failed. Please try again.");
//       setShowError(true);
//     } catch (err) {
//       // Default fallback message
//       let msg = "Signup failed. Please try again.";

//       try {
//         const res = err?.response;
//         const status = res?.status;
//         // Try to read content-length header first (maps to the "400 44" vs "400 111" you saw)
//         const headerCL =
//           res?.headers?.['content-length'] ||
//           res?.headers?.['Content-Length'] ||
//           null;

//         const contentLength = headerCL ? Number(headerCL) : null;

//         // Map the content lengths you provided to messages:
//         if (status === 400 && contentLength === 44) {
//           msg = "Please enter a valid email address";
//         } else if (status === 400 && contentLength === 111) {
//           msg = FRIENDLY_EMAIL_EXISTS;
//         } else {
//           // fallback: try to interpret response body (array/dict/string)
//           const data = res?.data;
//           if (Array.isArray(data)) {
//             // your earlier DRF array form -> show friendly message if "exist" detected
//             const foundExist = data.some((pair) => {
//               const key = pair?.[0];
//               const msgs = pair?.[1];
//               if (key && typeof key === 'string' && /email|username/i.test(key)) return true;
//               if (Array.isArray(msgs)) {
//                 return msgs.some((m) => typeof m === 'string' && /exist|already/i.test(m));
//               }
//               return false;
//             });
//             if (foundExist) msg = FRIENDLY_EMAIL_EXISTS;
//             else msg = "Please check your signup inputs.";
//           } else if (data && typeof data === 'object') {
//             // dict shape
//             const emailErr = data.email;
//             const usernameErr = data.username;
//             const anyMatch =
//               (Array.isArray(emailErr) && emailErr.some((s) => /exist|already|valid/i.test(s))) ||
//               (Array.isArray(usernameErr) && usernameErr.some((s) => /exist|already|valid/i.test(s)));

//             // If backend returns a code (recommended), honor it:
//             if (data.code === 'invalid_email' || data.code === 'invalid_email_format') {
//               msg = "Please enter a valid email address";
//             } else if (data.code === 'email_exists' || anyMatch) {
//               msg = FRIENDLY_EMAIL_EXISTS;
//             } else if (data.detail && typeof data.detail === 'string') {
//               msg = data.detail;
//             } else {
//               msg = "Signup failed. Please check your input.";
//             }
//           } else if (typeof data === 'string') {
//             if (/exist|already/i.test(data)) msg = FRIENDLY_EMAIL_EXISTS;
//             else if (/valid email/i.test(data) || /Enter a valid email address/i.test(data)) {
//               msg = "Please enter a valid email address";
//             } else {
//               msg = data;
//             }
//           }
//         }
//       } catch (parseErr) {
//         // silent fallback
//         msg = "Signup failed. Please try again.";
//       }

//       setErrorMsg(msg);
//       setShowError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 15 }}>
//       <Box
//         component="form"
//         display="flex"
//         flexDirection="column"
//         alignItems="center"
//         onSubmit={handleSignup}
//       >
//         <img src={LogoLogin} alt="Logo" style={{ marginBottom: theme.spacing(2), height: 60 }} />
//         <Typography variant="h5" component="h2" align="center" gutterBottom>
//           Sign Up
//         </Typography>
//         <Typography variant="h6" component="h4" align="center" gutterBottom>
//           Create an account to get started
//         </Typography>

//         <Collapse in={showError} sx={{ width: '100%', mb: 1 }}>
//           <Alert severity="error" onClose={() => setShowError(false)} sx={{ width: '100%' }}>
//             {errorMsg}
//           </Alert>
//         </Collapse>

//         <TextField
//           label="Email"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           autoComplete="email"
//         />
//         <TextField
//           label="Password"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           autoComplete="new-password"
//         />

//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           sx={{ marginTop: theme.spacing(2) }}
//           disabled={loading}
//         >
//           {loading ? "Creating account..." : "Sign Up"}
//         </Button>

//         <Button
//           type="button"
//           variant="text"
//           color="secondary"
//           fullWidth
//           onClick={() => navigate('/login')}
//           sx={{ marginTop: theme.spacing(2) }}
//         >
//           Already have an Account? Sign In here.
//         </Button>
//       </Box>
//     </Paper>
//   );
// }

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
  const { setUser } = useOutletContext(); // kept in case you want to use it later

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
