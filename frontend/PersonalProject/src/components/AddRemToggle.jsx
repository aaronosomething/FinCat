import { IconButton, Box, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export default function AddRemToggle({ isRemove, onClick }) {
    return (
        <Box >
            <IconButton onClick={onClick} sx={{ border: 2, borderRadius: '6px'}}>
                <Typography>Add/Rem</Typography>
                {isRemove ? <Remove /> : <Add />}
            </IconButton>
        </Box>
    );
}