import React from 'react';
import { Grid, Box, Typography, } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import FavoriteGoalsCard from '../components/FavoriteGoalsCard';
import GoalsPage from './GoalsPage';
import InvestChartDashboard from '../components/InvestChartDashboard';
import NetworthChartDashboard from '../components/NetworthChartDashbaord';

export default function DashboardPage() {
  const navigate = useNavigate();
  const handleNavigateToNetWorth = () => {
    navigate('/networth');
  };
  const handleNavigateToInvestments = () => {
    navigate('/invest');
  };
  const handleNavigateToGoals = () => {
    navigate('/goals');
  };
  const handleNavigateToRetirement = () => {
    navigate('/retire');
  };

  return (
    <div>
      <Typography variant='h3' align="center">My Dashboard</Typography>
      <Grid container spacing={3} justifyContent="center" pt={2} sx={{
        justifyContent: 'space-evenly',
        alignItems: 'center'}}>
      {/* Box 1 */}
      <Grid item xs={12} sm={6} md={3} onClick={handleNavigateToNetWorth}>
        <NetworthChartDashboard />
      </Grid>

      {/* Box 2 */}
      <Grid item xs={12} sm={6} md={3} onClick={handleNavigateToInvestments}>
        <InvestChartDashboard />
      </Grid>

      {/* Box 3 */}
      <Grid item xs={6} sm={2} md={1}>
        <Box onClick={handleNavigateToGoals} p={4}>
          <FavoriteGoalsCard/>
        </Box>
      </Grid>

      {/* Box 4 */}
      <Grid item xs={12} sm={6} md={3}>
        <Box onClick={handleNavigateToRetirement}
          sx={{
            height: '300px',
            width: '200px',
            border: '2px dotted grey',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            backgroundColor: 'lightgrey',
            cursor: 'pointer',
          }}
        >
          Retirement Readiness
        </Box>
      </Grid>
    </Grid>
    </div>
  )
}