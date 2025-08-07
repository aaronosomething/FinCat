import React, { useState } from 'react'
import LogoLogin from '../assets/FinCat_login.png';
import { Box, Typography, Button, TextField, Paper } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { registerUser } from "../api"
import { useTheme } from '@mui/material/styles';

export default function SignupPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useOutletContext();
    const handleNavigateToDashboard = () => {
        navigate("/dashboard");
    };
    return (
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 15 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
                <img src={LogoLogin} alt="Logo" style={{ marginBottom: theme.spacing(2), height: 60 }} />
                <Typography variant="h5" component="h2" align="center" gutterBottom>
                    Sign Up
                </Typography>
                <Typography variant="h6" component="h4" align="center" gutterBottom>
                    Create an account to get started
                </Typography>
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={async (e) => {
                        e.preventDefault();
                        setUser(await registerUser(email, password));
                        handleNavigateToDashboard();
                    }}
                    sx={{ marginTop: theme.spacing(2) }}
                >
                    Sign Up
                </Button>
                <Button
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
    )
}