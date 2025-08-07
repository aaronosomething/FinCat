import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  Toolbar,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AttachMoney as BudgetIcon,
  TrendingUp as InvestIcon,
  BeachAccess as RetireIcon,
  AccountBalanceWallet as NetWorthIcon,
  Flag as GoalsIcon,
} from '@mui/icons-material';


const drawerWidth = 90;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="large" />, path: '/dashboard' },
  { label: 'Budget', icon: <BudgetIcon fontSize="large" />, path: '/budget' },
  { label: 'Invest', icon: <InvestIcon fontSize="large" />, path: '/invest' },
  { label: 'Retire', icon: <RetireIcon fontSize="large" />, path: '/retire' },
  { label: 'Net Worth', icon: <NetWorthIcon fontSize="large" />, path: '/networth' },
  { label: 'Goals', icon: <GoalsIcon fontSize="large" />, path: '/goals' },
];

const ResponsiveDrawer = ({ isMdUp, drawerOpen, handleDrawerToggle, user }) => {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleClick = (path) => {
    if (user === null) {
      setSnackbarOpen(true); // Show Snackbar if user is not logged in
    } else {
      navigate(path); // Navigate if user is logged in
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };


  return (
    <Box
      component="nav"
      sx={{
        width: isMdUp ? drawerWidth : 'auto',
        flexShrink: { md: 0 },
      }}
      aria-label="navigation drawer"
    >
      <Drawer
        variant={isMdUp ? 'permanent' : 'temporary'}
        open={isMdUp || drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            alignItems: 'center',
          },
        }}
      >
        <Toolbar />
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {menuItems.map(({ label, icon, path }) => (
            <Tooltip key={label} title={<h2>{label}</h2>} placement="right">
              <ListItem disablePadding>
                <IconButton
                  onClick={() => handleClick(path)}
                  sx={{
                    width: 75,
                    height: 75,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </IconButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>

      </Drawer>
        <Snackbar open={snackbarOpen} anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
            You must be logged in to access this page!
          </Alert>
        </Snackbar>
    </Box>
  );
};


export default ResponsiveDrawer;
