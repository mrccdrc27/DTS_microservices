import { useState, useEffect } from 'react';
import { workflowAPI } from '../services/api';

export const useWorkflowData = () => {
    const [actions, setActions] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isLoadingActions, setIsLoadingActions] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingActions(true);
                const [actionsData, positionsData] = await Promise.all([
                    workflowAPI.getActions(),
                    workflowAPI.getPositions()
                ]);
                setActions(actionsData);
                setPositions(positionsData);
                setError(null);
            } catch (error) {
                setError('Failed to load data');
                console.error('Error loading data:', error);
            } finally {
                setIsLoadingActions(false);
            }
        };

        loadData();
    }, []);

    return { actions, positions, isLoadingActions, error, setError };
};