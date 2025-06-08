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

  // Modified to use the correct endpoint with query parameter
  getStepsByWorkflowId: async (workflowId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workflow/steps/?workflow=${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching steps:', error);
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

  // Steps API - FIXED: Use consistent endpoint
  createStep: async (stepData) => {
    try {
      console.log('Creating step with data:', stepData);
      const response = await axios.post(`${API_BASE_URL}/workflow/steps/`, stepData);
      console.log('Step created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating step:', error);
      console.error('Request data:', stepData);
      throw error;
    }
  },
  updateStep: async (stepId, stepData) => {
    try {
      console.log('Updating step with data:', stepData);
      const response = await axios.put(`${API_BASE_URL}/workflow/steps/${stepId}/`, stepData);
      console.log('Step updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  },
  deleteStep: async (stepId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/workflow/steps/${stepId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  },

  // (Unchanged) Get available positions
  getPositions: async () => {
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

function StepCard({ step, index, isActive, onClick, onDelete, onSave, isSaving, isDeleting, positions }) {
  const cardClasses = `${styles.stepCard} ${isActive ? styles.stepCardActive : ''}`;
  
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card selection when deleting
    if (window.confirm(`Are you sure you want to delete "${step.stepName || 'Untitled Step'}"?`)) {
      await onDelete(step.id, index);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation(); // Prevent card selection when saving
    await onSave(step, index);
  };

  // Find the position name from the positions array
  const positionName = positions.find(p => p.id === step.position)?.positionName || 'Not assigned';
  const roleName = positions.find(p => p.id === step.roleId)?.positionName || 'Not assigned';

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={styles.stepCardHeader}>
        <h4 className={styles.stepTitle}>
          Step {index + 1}: {step.stepName || 'Untitled Step'}
        </h4>
        <div className={styles.stepCardActions}>
          <button
            className={styles.stepSaveButton}
            onClick={handleSave}
            disabled={isSaving}
            title="Save step"
          >
            {isSaving ? '⏳' : '💾'}
          </button>
          {step.id && (
            <button
              className={styles.stepDeleteButton}
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete step"
            >
              {isDeleting ? '⏳' : '🗑️'}
            </button>
          )}
          {!step.id && (
            <span className={styles.unsavedIndicator} title="Unsaved step">
              ✏️
            </span>
          )}
        </div>
      </div>
      <p className={styles.stepInfo}>Position: {positionName}</p>
      <p className={styles.stepInfo}>Role: {roleName}</p>
      <p className={styles.stepInfo}>Actions: {step.actions?.length || 0}</p>
      <p className={styles.stepStatus}>
        Status: {step.id ? 'Saved' : 'Not saved'}
      </p>
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

  const [steps, setSteps] = useState([]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [actions, setActions] = useState([]);
  const [positions, setPositions] = useState([]);

  const [isLoadingActions, setIsLoadingActions] = useState(true);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isDeletingStep, setIsDeletingStep] = useState(false);
  const [stepOperations, setStepOperations] = useState({}); // Track individual step operations
  const [error, setError] = useState(null);

  // Load positions on mount
  useEffect(() => {
    async function loadPositions() {
      try {
        const response = await api.getPositions();
        setPositions(response);
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      }
    }
    loadPositions();
  }, []);

  // 3) On mount, fetch the existing workflow data and steps
  useEffect(() => {
    async function fetchWorkflowAndSteps() {
      try {
        setIsLoadingSteps(true);
        
        // Fetch workflow data
        const workflowData = await api.getWorkflow(workflowId);
        setWorkflow({
          id: workflowData.id,
          userID: workflowData.userID,
          workflowName: workflowData.workflowName,
          description: workflowData.description,
          mainCategory: workflowData.mainCategory,
          subCategory: workflowData.subCategory,
        });

        // Fetch steps associated with this workflow
        try {
          const stepsData = await api.getStepsByWorkflowId(workflowId);
          console.log('Fetched steps:', stepsData);
          
          if (Array.isArray(stepsData) && stepsData.length > 0) {
            const formattedSteps = stepsData.map((s) => ({
              id: s.id,
              workflow: s.workflow,
              position: s.position, // This is now the position ID from API
              stepName: s.stepName,
              description: s.description,
              roleId: s.roleId || '', // Add roleId field
              actions: Array.isArray(s.actions)
                ? s.actions.map((a) => ({
                    actionId: a.actionId,
                    routeToStep: a.routeToStep,
                  }))
                : [{ actionId: '', routeToStep: '' }],
            }));
            
            // Sort steps by position (position ID)
            formattedSteps.sort((a, b) => (a.position || 0) - (b.position || 0));
            setSteps(formattedSteps);
          } else {
            // No existing steps, create a default empty step
            setSteps([
              {
                id: null,
                workflow: workflowData.id,
                position: '', // Empty - user needs to select a position
                stepName: '',
                description: '',
                roleId: '', // Add roleId field
                actions: [{ actionId: '', routeToStep: '' }],
              },
            ]);
          }
        } catch (stepsError) {
          console.error('Error fetching steps:', stepsError);
          // If steps fetch fails, create a default empty step
          setSteps([
            {
              id: null,
              workflow: workflowData.id,
              position: '', // Empty - user needs to select a position
              stepName: '',
              description: '',
              roleId: '', // Add roleId field
              actions: [{ actionId: '', routeToStep: '' }],
            },
          ]);
        }
        
      } catch (err) {
        console.error('Failed to fetch workflow:', err);
        setError('Could not load workflow');
      } finally {
        setIsLoadingSteps(false);
      }
    }
    
    if (workflowId) {
      fetchWorkflowAndSteps();
    }
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

  // 10) FIXED: Save or create the active step
  const saveStep = async () => {
    if (!workflow.id) {
      alert('Please save the workflow first before saving steps.');
      return;
    }

    try {
      setIsSavingStep(true);
      setError(null);

      const activeStep = steps[activeStepIndex];
      
      // Validate required fields
      if (!activeStep.stepName?.trim()) {
        alert('Please enter a step name before saving.');
        return;
      }

      if (!activeStep.position) {
        alert('Please select a position before saving.');
        return;
      }

      const stepData = {
        workflow: parseInt(workflow.id), // Ensure it's a number
        position: parseInt(activeStep.position), // Position is the selected position ID
        stepName: activeStep.stepName.trim(),
        description: activeStep.description || '',
        roleId: activeStep.roleId || null, // Send null if no role selected
        actions: activeStep.actions.filter((act) => act.actionId), // Only include actions with actionId
      };

      console.log('Saving step data:', stepData);

      let savedStep;
      if (activeStep.id) {
        // Update existing step
        savedStep = await api.updateStep(activeStep.id, stepData);
      } else {
        // Create new step
        savedStep = await api.createStep(stepData);
      }

      console.log('Saved step response:', savedStep);

      // FIXED: Update the local state with the server response
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === activeStepIndex 
            ? { 
                ...step, 
                id: savedStep.id,
                workflow: savedStep.workflow || step.workflow,
                position: savedStep.position || step.position,
                stepName: savedStep.stepName || step.stepName,
                description: savedStep.description || step.description,
                roleId: savedStep.roleId || step.roleId,
                actions: savedStep.actions || step.actions
              } 
            : step
        )
      );
      
      alert('Step saved successfully!');
    } catch (err) {
      console.error('Error saving step:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to save step: ' + (err.response?.data?.message || err.message));
      alert('Failed to save step. Check console for details.');
    } finally {
      setIsSavingStep(false);
    }
  };

  // FIXED: Save a specific step from StepCard
  const saveStepFromCard = async (step, stepIndex) => {
    if (!workflow.id) {
      alert('Please save the workflow first before saving steps.');
      return;
    }

    try {
      // Set loading state for this specific step
      setStepOperations(prev => ({ ...prev, [`save_${stepIndex}`]: true }));
      setError(null);

      // Validate required fields
      if (!step.stepName?.trim()) {
        alert('Please enter a step name before saving.');
        return;
      }

      if (!step.position) {
        alert('Please select a position before saving.');
        return;
      }

      const stepData = {
        workflow: parseInt(workflow.id), // Ensure it's a number
        position: parseInt(step.position), // Position is the selected position ID
        stepName: step.stepName.trim(),
        description: step.description || '',
        roleId: step.roleId || null, // Send null if no role selected
        actions: step.actions.filter((act) => act.actionId), // Only include actions with actionId
      };

      console.log('Saving step from card:', stepData);

      let savedStep;
      if (step.id) {
        // Update existing step
        savedStep = await api.updateStep(step.id, stepData);
      } else {
        // Create new step
        savedStep = await api.createStep(stepData);
      }

      console.log('Saved step from card response:', savedStep);

      // FIXED: Update the local state with the server response
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === stepIndex 
            ? { 
                ...s, 
                id: savedStep.id,
                workflow: savedStep.workflow || s.workflow,
                position: savedStep.position || s.position,
                stepName: savedStep.stepName || s.stepName,
                description: savedStep.description || s.description,
                roleId: savedStep.roleId || s.roleId,
                actions: savedStep.actions || s.actions
              } 
            : s
        )
      );
      
      alert(`Step "${step.stepName || 'Untitled'}" saved successfully!`);
    } catch (err) {
      console.error('Error saving step from card:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to save step: ' + (err.response?.data?.message || err.message));
      alert('Failed to save step. Check console for details.');
    } finally {
      setStepOperations(prev => ({ ...prev, [`save_${stepIndex}`]: false }));
    }
  };

  // NEW: Delete a specific step from StepCard
  const deleteStepFromCard = async (stepId, stepIndex) => {
    if (!stepId) {
      // If step is not saved yet, just remove it from local state
      setSteps(prev => prev.filter((_, idx) => idx !== stepIndex));
      // Adjust active step index if necessary
      if (stepIndex === activeStepIndex && steps.length > 1) {
        setActiveStepIndex(Math.max(0, stepIndex - 1));
      } else if (stepIndex < activeStepIndex) {
        setActiveStepIndex(prev => prev - 1);
      }
      return;
    }

    try {
      // Set loading state for this specific step
      setStepOperations(prev => ({ ...prev, [`delete_${stepIndex}`]: true }));
      setError(null);

      await api.deleteStep(stepId);
      
      // Remove step from local state
      setSteps(prev => prev.filter((_, idx) => idx !== stepIndex));
      
      // Adjust active step index if necessary
      if (stepIndex === activeStepIndex && steps.length > 1) {
        setActiveStepIndex(Math.max(0, stepIndex - 1));
      } else if (stepIndex < activeStepIndex) {
        setActiveStepIndex(prev => prev - 1);
      }
      
      alert('Step deleted successfully!');
    } catch (err) {
      console.error('Error deleting step:', err);
      setError('Failed to delete step');
      alert('Failed to delete step. Please try again.');
    } finally {
      setStepOperations(prev => ({ ...prev, [`delete_${stepIndex}`]: false }));
    }
  };

  // 11) Add a brand‐new empty step
  const addStep = () => {
    const newStep = {
      id: null,
      workflow: workflow.id,
      position: '', // Empty - user needs to select a position
      stepName: '',
      description: '',
      roleId: '', // Add roleId field
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

  // 14) Show a loading state while fetching actions or steps
  if (isLoadingActions || isLoadingSteps) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading {isLoadingActions ? 'actions' : 'steps'}…
        </div>
      </div>
    );
  }

  // Show message if no steps are available
  if (!steps || steps.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noSteps}>
          <h3>No steps found for this workflow</h3>
          <button onClick={addStep} className={styles.button}>
            Add First Step
          </button>
        </div>
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
              <label className={styles.label}>Position</label>
              <select 
                className={styles.input}
                value={activeStep?.position || ''}
                onChange={(e) => handleStepChange('position', e.target.value)}
                disabled={isSavingStep}
              >
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
            <h3>Workflow Steps ({steps.length})</h3>
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
                key={step.id || `step-${index}`}
                step={step}
                index={index}
                isActive={index === activeStepIndex}
                onClick={() => setActiveStepIndex(index)}
                onDelete={deleteStepFromCard}
                onSave={saveStepFromCard}
                isSaving={stepOperations[`save_${index}`] || false}
                isDeleting={stepOperations[`delete_${index}`] || false}
                positions={positions}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}