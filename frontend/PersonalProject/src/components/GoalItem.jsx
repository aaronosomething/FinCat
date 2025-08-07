import { Box, Checkbox, IconButton, Typography, Tooltip } from '@mui/material';
import { Star, StarBorder, Delete } from '@mui/icons-material';

export default function GoalItem({
  goal,
  onToggleFavorite,
  onToggleComplete,
  onDelete,
  editable = false,
}) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={1} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <IconButton onClick={() => onToggleFavorite(goal.id)}>
        {goal.is_favorite ? <Star /> : <StarBorder />}
      </IconButton>

      <Typography sx={{ flexGrow: 1 }}>{goal.goal_name}</Typography>

      {editable ? (
        <IconButton onClick={() => onDelete(goal.id)}>
          <Delete />
        </IconButton>
      ) : (
        <Tooltip title="Complete Goal" placement="left">
          <Checkbox
            checked={goal.is_complete}
            onChange={() => onToggleComplete(goal.id)}
          />
        </Tooltip>
      )}
    </Box>
  );
}
