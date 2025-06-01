import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // v6
import styles from './WorkflowManager.module.css';

// API configuration
const API_BASE_URL = 'http://localhost:2000';

// API service functions
const api = {
  createWorkflow: async (workflowData) => {
    const response = await axios.post(
      `${API_BASE_URL}/workflow/create/`,
      workflowData
    );
    return response.data;
  },
};

export default function WorkflowCreate() {
  const navigate = useNavigate();

  // Workflow state
  const [workflow, setWorkflow] = useState({
    id: null,
    userID: 1,
    workflowName: '',
    description: '',
    mainCategory: '',
    subCategory: '',
  });

  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [error, setError] = useState(null);

  const handleWorkflowChange = (field, value) => {
    setWorkflow((prev) => ({ ...prev, [field]: value }));
  };

  const saveWorkflow = async () => {
    try {
      setIsSavingWorkflow(true);
      setError(null);

      const workflowData = {
        userID: workflow.userID,
        workflowName: workflow.workflowName,
        description: workflow.description,
        mainCategory: workflow.mainCategory,
        subCategory: workflow.subCategory,
      };

      // No need to check workflow.id here if you're only creating;
      // just call createWorkflow:
      const savedWorkflow = await api.createWorkflow(workflowData);

      // savedWorkflow.id is what the backend returned
      setWorkflow((prev) => ({ ...prev, id: savedWorkflow.id }));

      // Now that we know the new ID, redirect to /workflow/edit/<id>
      navigate(`/test/edit/${savedWorkflow.id}`);
    } catch (err) {
      console.error('Error saving workflow:', err);
      setError('Failed to save workflow');
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className={styles.leftPanel}>
        <div className={styles.workflowSection}>
          <div className={styles.header}>
            <h2>Workflow Configuration</h2>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Workflow Name</label>
              <input
                className={styles.input}
                type="text"
                value={workflow.workflowName}
                onChange={(e) =>
                  handleWorkflowChange('workflowName', e.target.value)
                }
                placeholder="Enter workflow name"
                disabled={isSavingWorkflow}
              />
            </div>
            <div className={styles.formGroupSmall}>
              <label className={styles.label}>Main Category</label>
              <input
                className={styles.input}
                type="text"
                value={workflow.mainCategory}
                onChange={(e) =>
                  handleWorkflowChange('mainCategory', e.target.value)
                }
                placeholder="Enter Category"
                disabled={isSavingWorkflow}
              />
            </div>
            <div className={styles.formGroupSmall}>
              <label className={styles.label}>Sub Category</label>
              <input
                className={styles.input}
                type="text"
                value={workflow.subCategory}
                onChange={(e) =>
                  handleWorkflowChange('subCategory', e.target.value)
                }
                placeholder="Sub category"
                disabled={isSavingWorkflow}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={workflow.description}
              onChange={(e) =>
                handleWorkflowChange('description', e.target.value)
              }
              placeholder="Describe the workflow purpose and process"
              disabled={isSavingWorkflow}
            />
          </div>

          <button
            className={styles.button}
            onClick={saveWorkflow}
            disabled={isSavingWorkflow}
          >
            {isSavingWorkflow ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}
