import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Switch,
    Box,
    Button,
} from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import ResponsiveDrawer from './ResponsiveDrawer';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import LogoDarkMode from '../assets/FinCat_darkmode.png';
import { Alert, Snackbar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import NightlightRound from '@mui/icons-material/NightlightRound';
import LightMode from '@mui/icons-material/LightMode';
import { logoutUser } from '../api';

const drawerWidth = 90;

const Navbar = ({ user, setUser, mode, setMode }) => {
    const handleToggleDarkMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        if (mode == 'light') {
            localStorage.setItem('theme', 'dark')
        } else {
            localStorage.setItem('theme', 'light')
        }
    };
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navigate = useNavigate();

    const handleUserMenuClick = (event) => {
        if (!user) {
            navigate('/login');
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const [openAlert, setOpenAlert] = useState(false);
    const handleCloseAlert = () => {
        setOpenAlert(false); // Hide the alert
    };
    const handleLogout = () => {
        handleCloseMenu();
        logoutUser().then(() => {
            setUser(null);
            setOpenAlert(true);
            navigate('/login');
        });
    };



    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    ml: isMdUp ? `${drawerWidth}px` : 0,
                    width: isMdUp ? `calc(100% - ${drawerWidth}px)` : '100%',
                }}
            >
                <Toolbar>
                    {!isMdUp && (
                        <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        <img
                            src={LogoDarkMode}
                            alt="Logo"
                            style={{ height: '40px', marginRight: '10px', verticalAlign: 'middle', marginBottom: '10px' }}
                        />
                        FinCat
                    </Typography>

                    {isMdUp ? (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                            onClick={handleUserMenuClick}
                        >
                            <Typography sx={{ mr: 1 }}>
                                {user?.username || (typeof user === 'string' ? user : 'Login / Create Account')}
                            </Typography>
                            <IconButton color="inherit">
                                <AccountCircle />
                            </IconButton>
                        </Box>
                    ) : (
                        <IconButton
                            aria-controls="user-menu"
                            aria-haspopup="true"
                            onClick={handleUserMenuClick}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    )}

                    {user && (
                        <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                        >
                            <MenuItem>
                                <LightMode/>
                                <Switch checked={mode === 'dark'} onChange={handleToggleDarkMode} />
                                <NightlightRound/>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    )}
                </Toolbar>
                <Snackbar open={openAlert} anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={6000} onClose={handleCloseAlert}>
                    <Alert onClose={handleCloseAlert} icon={<CheckIcon fontSize="inherit" />} severity="success">
                        You have been logged out.
                    </Alert>
                </Snackbar>
            </AppBar>

            <ResponsiveDrawer
                isMdUp={isMdUp}
                drawerOpen={drawerOpen}
                handleDrawerToggle={handleDrawerToggle}
                user={user}
            />

            {/* Push content below AppBar */}
            <Toolbar />
        </>
    );
};

export default Navbar;
