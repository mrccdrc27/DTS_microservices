import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './WorkflowManager.module.css';

// API configuration
const API_BASE_URL = 'http://localhost:2000';

// API service functions
const api = {
  // Fetch a single workflow by ID
  getWorkflow: async (id) => {
    console.log('id', id)
    try {
      const response = await axios.get(`${API_BASE_URL}/workflow/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  // Update an existing workflow
  updateWorkflow: async (workflowId, workflowData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/workflows/${workflowId}`,
        workflowData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  // (Unchanged) Actions API
  getActions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/action/list/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actions:', error);
      throw error;
    }
  },

  // (Unchanged) Steps API
  createStep: async (stepData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/steps`, stepData);
      return response.data;
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  },
  updateStep: async (stepId, stepData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/steps/${stepId}`, stepData);
      return response.data;
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  },

  // (Unchanged) Get available positions
  getPositions: async (workflowId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/position/list/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },
};

function ActionRow({
  action,
  onActionChange,
  onRouteChange,
  onRemove,
  availableSteps,
  actions,
  isLoading,
}) {
  return (
    <div className={styles.actionRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Action</label>
        <select
          className={styles.select}
          value={action.actionId || ''}
          onChange={(e) => onActionChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select Action</option>
          {actions.map((act) => (
            <option key={act.id} value={act.id}>
              {act.actionName}
            </option>
          ))}
        </select>
      </div>
      <button
        className={styles.removeButton}
        onClick={onRemove}
        disabled={isLoading}
      >
        Remove
      </button>
    </div>
  );
}

function StepCard({ step, index, isActive, onClick }) {
  const cardClasses = `${styles.stepCard} ${isActive ? styles.stepCardActive : ''}`;
  return (
    <div className={cardClasses} onClick={onClick}>
      <h4 className={styles.stepTitle}>
        Step {index + 1}: {step.stepName || 'Untitled Step'}
      </h4>
      <p className={styles.stepInfo}>Position: {step.position || index + 1}</p>
      <p className={styles.stepInfo}>Actions: {step.actions?.length || 0}</p>
    </div>
  );
}

export default function WorkflowEdit() {
  // 1) Read the workflowId from URL params
  const { id } = useParams();
  const workflowId = id

  // 2) State hooks
  const [workflow, setWorkflow] = useState({
    id: null,
    userID: null,
    workflowName: '',
    description: '',
    mainCategory: '',
    subCategory: '',
  });

  const [steps, setSteps] = useState([
    {
      id: null,
      workflow: null,
      position: 1,
      stepName: '',
      description: '',
      actions: [{ actionId: '', routeToStep: '' }],
    },
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [actions, setActions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);

  const [isLoadingActions, setIsLoadingActions] = useState(true);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [error, setError] = useState(null);

  // 3) On mount, fetch the existing workflow data
  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const data = await api.getWorkflow(workflowId);
        // Assume backend returns { id, userID, workflowName, description, mainCategory, subCategory, steps: [...] }
        setWorkflow({
          id: data.id,
          userID: data.userID,
          workflowName: data.workflowName,
          description: data.description,
          mainCategory: data.mainCategory,
          subCategory: data.subCategory,
        });
        if (Array.isArray(data.steps) && data.steps.length > 0) {
          setSteps(
            data.steps.map((s) => ({
              id: s.id,
              workflow: s.workflow,
              position: s.position,
              stepName: s.stepName,
              description: s.description,
              actions: Array.isArray(s.actions)
                ? s.actions.map((a) => ({
                    actionId: a.actionId,
                    routeToStep: a.routeToStep,
                  }))
                : [{ actionId: '', routeToStep: '' }],
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch workflow:', err);
        setError('Could not load workflow');
      }
    }
    fetchWorkflow();
  }, [workflowId]);

  // 4) Load all available actions on mount
  useEffect(() => {
    async function loadActions() {
      try {
        setIsLoadingActions(true);
        const actionsData = await api.getActions();
        setActions(actionsData);
      } catch (err) {
        console.error('Error loading actions:', err);
        setError('Failed to load actions');
      } finally {
        setIsLoadingActions(false);
      }
    }
    loadActions();
  }, []);

  // 5) Load positions once we have a workflow ID
  useEffect(() => {
    if (!workflow.id) return;
    async function loadPositions() {
      try {
        const posData = await api.getPositions(workflow.id);
        setAvailablePositions(posData);
      } catch (err) {
        console.error('Error loading positions:', err);
      }
    }
    loadPositions();
  }, [workflow.id]);

  // 6) Handle input changes for workflow
  const handleWorkflowChange = (field, value) => {
    setWorkflow((prev) => ({ ...prev, [field]: value }));
  };

  // 7) Handle changes inside the active step
  const handleStepChange = (field, value) => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === activeStepIndex ? { ...step, [field]: value } : step
      )
    );
  };

  // 8) Handle action‐level changes
  const handleActionChange = (actionIndex, field, value) => {
    setSteps((prev) =>
      prev.map((step, stepIdx) =>
        stepIdx === activeStepIndex
          ? {
              ...step,
              actions: step.actions.map((act, actIdx) =>
                actIdx === actionIndex ? { ...act, [field]: value } : act
              ),
            }
          : step
      )
    );
  };

  // 9) Save the workflow (always update, never create)
  const saveWorkflow = async () => {
    try {
      setIsSavingWorkflow(true);
      setError(null);

      const payload = {
        userID: workflow.userID,
        workflowName: workflow.workflowName,
        description: workflow.description,
        mainCategory: workflow.mainCategory,
        subCategory: workflow.subCategory,
      };

      await api.updateWorkflow(workflowId, payload);
      alert('Workflow updated successfully!');
    } catch (err) {
      console.error('Error updating workflow:', err);
      setError('Failed to save workflow');
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  // 10) Save or create the active step
  const saveStep = async () => {
    if (!workflow.id) {
      alert('Please save the workflow first before saving steps.');
      return;
    }

    try {
      setIsSavingStep(true);
      setError(null);

      const activeStep = steps[activeStepIndex];
      const stepData = {
        workflow: workflow.id,
        position: activeStep.position,
        stepName: activeStep.stepName,
        description: activeStep.description,
        actions: activeStep.actions.filter((act) => act.actionId),
      };

      let savedStep;
      if (activeStep.id) {
        // Update existing step
        savedStep = await api.updateStep(activeStep.id, stepData);
      } else {
        // Create new step
        savedStep = await api.createStep(stepData);
      }

      // Replace the local step with whatever the server returns
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === activeStepIndex ? { ...step, id: savedStep.id, ...savedStep } : step
        )
      );
      alert('Step saved successfully!');
    } catch (err) {
      console.error('Error saving step:', err);
      setError('Failed to save step');
      alert('Failed to save step. Please try again.');
    } finally {
      setIsSavingStep(false);
    }
  };

  // 11) Add a brand‐new empty step
  const addStep = () => {
    const newStep = {
      id: null,
      workflow: workflow.id,
      position: steps.length + 1,
      stepName: '',
      description: '',
      actions: [{ actionId: '', routeToStep: '' }],
    };
    setSteps((prev) => [...prev, newStep]);
    setActiveStepIndex(steps.length);
  };

  // 12) Add an empty action to the active step
  const addAction = () => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === activeStepIndex
          ? {
              ...step,
              actions: [...step.actions, { actionId: '', routeToStep: '' }],
            }
          : step
      )
    );
  };

  // 13) Remove a specific action from the active step
  const removeAction = (actionIndex) => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === activeStepIndex
          ? {
              ...step,
              actions: step.actions.filter((_, actIdx) => actIdx !== actionIndex),
            }
          : step
      )
    );
  };

  const activeStep = steps[activeStepIndex] || steps[0];

  // 14) Show a loading state while fetching all actions
  if (isLoadingActions) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading actions…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Left Panel – Workflow + Step Configuration */}
      <div className={styles.leftPanel}>
        {/* Workflow Configuration */}
        <div className={styles.workflowSection}>
          <div className={styles.header}>
            <h2>Edit Workflow #{workflowId}</h2>
            <button
              className={styles.button}
              onClick={saveWorkflow}
              disabled={isSavingWorkflow}
            >
              {isSavingWorkflow ? 'Saving…' : 'Save Workflow'}
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Workflow Name</label>
              <input
                className={styles.input}
                type="text"
                value={workflow.workflowName}
                onChange={(e) => handleWorkflowChange('workflowName', e.target.value)}
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
                onChange={(e) => handleWorkflowChange('mainCategory', e.target.value)}
                placeholder="Enter category"
                disabled={isSavingWorkflow}
              />
            </div>
            <div className={styles.formGroupSmall}>
              <label className={styles.label}>Sub Category</label>
              <input
                className={styles.input}
                type="text"
                value={workflow.subCategory}
                onChange={(e) => handleWorkflowChange('subCategory', e.target.value)}
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
              onChange={(e) => handleWorkflowChange('description', e.target.value)}
              placeholder="Describe the workflow purpose and process"
              disabled={isSavingWorkflow}
            />
          </div>
        </div>

        {/* Step Configuration */}
        <div className={styles.stepSection}>
          <div className={styles.header}>
            <h3>
              Configure Step {activeStepIndex + 1}
              {activeStep?.stepName && `: ${activeStep.stepName}`}
            </h3>
            <button
              className={styles.button}
              onClick={saveStep}
              disabled={isSavingStep}
            >
              {isSavingStep ? 'Saving…' : 'Save Step'}
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Step Name</label>
              <input
                className={styles.input}
                type="text"
                value={activeStep?.stepName || ''}
                onChange={(e) => handleStepChange('stepName', e.target.value)}
                placeholder="Enter step name"
                disabled={isSavingStep}
              />
            </div>
            <div className={styles.formGroupSmall}>
              <label className={styles.label}>Role</label>
              <select className={styles.input}>
                <option value="">Select a position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.positionName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={activeStep?.description || ''}
              onChange={(e) => handleStepChange('description', e.target.value)}
              placeholder="Describe what happens in this step"
              disabled={isSavingStep}
            />
          </div>

          <div>
            <label className={styles.label}>Actions</label>
            <div className={styles.actionContainer}>
              {activeStep?.actions?.map((action, index) => (
                <ActionRow
                  key={index}
                  action={action}
                  onActionChange={(value) =>
                    handleActionChange(index, 'actionId', value)
                  }
                  onRouteChange={(value) =>
                    handleActionChange(index, 'routeToStep', value)
                  }
                  onRemove={() => removeAction(index)}
                  availableSteps={steps}
                  actions={actions}
                  isLoading={isSavingStep}
                />
              ))}
              <button
                className={styles.addButton}
                onClick={addAction}
                disabled={isSavingStep}
              >
                <span>+</span> Add Another Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel – Workflow Steps Overview */}
      <div className={styles.rightPanel}>
        <div className={styles.stepSection}>
          <div className={styles.header}>
            <h3>Workflow Steps</h3>
            <button
              className={styles.addButton}
              onClick={addStep}
              disabled={isSavingStep}
            >
              + Add Step
            </button>
          </div>

          <div className={styles.stepList}>
            {steps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                index={index}
                isActive={index === activeStepIndex}
                onClick={() => setActiveStepIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
