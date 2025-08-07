import { api } from './api';

/** ==========================
 * GOALS API
 * ==========================
 */

// GET all goals for the logged-in user
export const getAllGoals = async () => {
    const response = await api.get('goals/');
    return response.data;
};


// POST a new goal (requires goal_name)
export const addGoal = async (goal_name, is_long_term= false) => {
    const response = await api.post('goals/goal/', { goal_name, is_long_term });
    return response.data;
};


// DELETE a goal by ID
export const deleteGoal = async (goal_id) => {
    const response = await api.delete(`goals/goal/${goal_id}/`);
    return response.status === 204;
};


// GET all favorite goals
export const getFavoriteGoals = async () => {
    const response = await api.get('goals/favorites/');
    return response.data;
};


// Toggle favorite status of a goal
export const toggleFavorite = async (goal_id) => {
    const response = await api.post(`goals/favorites/${goal_id}/`);
    return response.data;
};


// GET all completed goals
export const getCompletedGoals = async () => {
    const response = await api.get('goals/completed/');
    return response.data;
};


// Toggle completed status of a goal
export const toggleComplete = async (goal_id) => {
    const response = await api.post(`goals/completed/${goal_id}/`);
    return response.data;
};
