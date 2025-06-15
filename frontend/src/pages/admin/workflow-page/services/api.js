import axios from 'axios';

const API_BASE_URL = 'http://localhost:2000';

export const workflowAPI = {
    getActions: async () => {
        const response = await axios.get(`${API_BASE_URL}/workflow/actions/`);
        return response.data;
    },

    createWorkflow: async (workflowData) => {
        const response = await axios.post(`${API_BASE_URL}/workflow/workflows/`, workflowData);
        return response.data;
    },

    updateWorkflow: async (workflowId, workflowData) => {
        const response = await axios.put(`${API_BASE_URL}/workflows/workflows/${workflowId}`, workflowData);
        return response.data;
    },

    createStep: async (stepData) => {
        const response = await axios.post(`${API_BASE_URL}/workflow/steps`, stepData);
        return response.data;
    },

    updateStep: async (stepId, stepData) => {
        const response = await axios.put(`${API_BASE_URL}/workflow/steps/${stepId}`, stepData);
        return response.data;
    },

    getPositions: async () => {
        const response = await axios.get(`${API_BASE_URL}/workflow/roles/`);
        return response.data;
    }
};