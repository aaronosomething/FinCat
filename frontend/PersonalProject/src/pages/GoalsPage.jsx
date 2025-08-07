import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, Paper, Grid,
} from '@mui/material';
import Grow from '@mui/material/Grow';
import AddRemToggle from '../components/AddRemToggle';
import GoalItem from '../components/GoalItem';
import {
  getAllGoals, addGoal, deleteGoal,
  toggleFavorite, toggleComplete
} from '../goals_api';

export default function GoalsPage() {
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [showFavLimitDialog, setShowFavLimitDialog] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [isLongTerm, setIsLongTerm] = useState(false); // control long-term vs short-term

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const all = await getAllGoals();
    setGoals(all);
  };

  const handleAddGoal = async () => {
    if (newGoalText.trim()) {
      await addGoal(newGoalText.trim(), isLongTerm);
      setNewGoalText('');
      setShowNewLine(false);
      loadGoals();
      setIsRemoveMode(false);
    }
  };

  const handleToggleFavorite = async (goalId) => {
    const favCount = goals.filter(g => g.is_favorite).length;
    const goal = goals.find(g => g.id === goalId);

    if (!goal.is_favorite && favCount >= 5) {
      setShowFavLimitDialog(true);
      return;
    }

    await toggleFavorite(goalId);
    loadGoals();
  };

  const handleToggleComplete = async (goalId) => {
    await toggleComplete(goalId);
    loadGoals();
  };

  const handleDelete = async (goalId) => {
    await deleteGoal(goalId);
    loadGoals();
  };

  const filteredGoals = (isLongTerm = false, isComplete = false) =>
    goals.filter(g => g.is_long_term === isLongTerm && g.is_complete === isComplete);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        p: 1,
        pl: 0,
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gridTemplateAreas: {
          xs: `
            "header"
            "short"
            "long"
            "completed"
          `,
          md: `
            "header header"
            "short long"
            "completed completed"
          `,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ gridArea: 'header' }}>
        <Typography variant="h4" mb={2}>Goals</Typography>
        <AddRemToggle isRemove={isRemoveMode} onClick={() => setIsRemoveMode(!isRemoveMode)} />
      </Box>

      {/* Short Term */}
      <Box sx={{ gridArea: 'short' }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Short Term</Typography>
          {filteredGoals(false, false).map(goal => (
            <GoalItem key={goal.id} {...{ goal, onToggleFavorite: handleToggleFavorite, onToggleComplete: handleToggleComplete, onDelete: handleDelete, editable: isRemoveMode }} />
          ))}
          {isRemoveMode && !showNewLine && (
            <Button onClick={() => { setIsLongTerm(false); setShowNewLine(true); }}>
              + Add Short Term Goal
            </Button>
          )}
          {showNewLine && !isLongTerm && (
            <Box mt={2} display="flex" gap={1}>
              <input
                placeholder="Enter new goal"
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
              />
              <Button onClick={handleAddGoal}>Add</Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowNewLine(false);
                  setNewGoalText('');
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Long Term */}
      <Box sx={{ gridArea: 'long' }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Long Term</Typography>
          {filteredGoals(true, false).map(goal => (
            <GoalItem key={goal.id} {...{ goal, onToggleFavorite: handleToggleFavorite, onToggleComplete: handleToggleComplete, onDelete: handleDelete, editable: isRemoveMode }} />
          ))}
          {isRemoveMode && !showNewLine && (
            <Button onClick={() => { setIsLongTerm(true); setShowNewLine(true); }}>
              + Add Long Term Goal
            </Button>
          )}
          {showNewLine && isLongTerm && (
            <Box mt={2} display="flex" gap={1}>
              <input
                placeholder="Enter new goal"
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
              />
              <Button onClick={handleAddGoal}>Add</Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowNewLine(false);
                  setNewGoalText('');
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Completed */}
      <Box sx={{ gridArea: 'completed' }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Completed Goals</Typography>
          {goals.filter(g => g.is_complete).map(goal => (
            <Grow in={true} timeout={500} key={goal.id}>
              <Box mb={2}>
                <Paper elevation={2} sx={{ padding: 0, bgcolor: theme.palette.mode === 'dark' ? '#3e7443ff' : '#7be685ff'}}>
                  <GoalItem
                    goal={goal}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    editable={isRemoveMode}
                  />
                </Paper>
              </Box>            
            </Grow>
          ))}
        </Paper>
      </Box>

      {/* Favorite Limit Dialog */}
      <Dialog open={showFavLimitDialog} onClose={() => setShowFavLimitDialog(false)}>
        <DialogTitle>Favorite Limit Reached</DialogTitle>
        <DialogContent>
          You can only mark 5 goals as favorites. Please remove one before adding another.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFavLimitDialog(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}