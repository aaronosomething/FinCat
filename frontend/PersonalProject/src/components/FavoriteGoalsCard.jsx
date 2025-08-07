import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getFavoriteGoals } from '../goals_api'; // adjust the path if needed

const FavoriteGoalsCard = () => {
  const theme = useTheme();
  const [favoriteGoals, setFavoriteGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const favorites = await getFavoriteGoals();
      setFavoriteGoals(favorites);
    };

    fetchGoals();
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        height: 300,
        padding: 3,
        backgroundColor: theme.palette.mode === 'light' ? '#fff9db' : '#afad46ff',
        fontFamily: `'Edu SA Hand', cursive`,
        overflowY: 'auto',
      }}
    >
      <Typography
        variant="h5"
        color='black'
        textAlign={'center'}
        sx={{
          fontFamily: `'Edu SA Hand', cursive`,
          fontWeight: 600,
          marginBottom: 1,
        }}
      >
        Financial Goals
      </Typography>

      <Divider sx={{ bgcolor: 'black', marginBottom: 2 }} />

      {favoriteGoals.length === 0 ? (
        <Typography color='black' sx={{fontFamily: `'Edu SA Hand', cursive`}}>Click to add a goal!</Typography>
      ) : (
        <Box component="ul" sx={{ paddingLeft: 2, margin: 0 }}>
          {favoriteGoals.map((goal) => (
            <li
              key={goal.id}
              style={{
                color:'black',
                textDecoration: goal.is_complete ? 'line-through' : 'none',
                marginBottom: '0.5rem',
                fontSize: 'clamp(0.8rem, 2vw, .85rem)',
              }}
            >
              {goal.goal_name}
            </li>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default FavoriteGoalsCard;
