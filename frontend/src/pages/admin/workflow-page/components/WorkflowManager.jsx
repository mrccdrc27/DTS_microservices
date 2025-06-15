import React, { useState } from 'react';
import { useWorkflowData } from '../hooks/useWorkflowData';
import { workflowAPI } from '../services/api';
import { WorkflowForm } from './WorkflowForm';
import { StepForm } from './StepForm';
import { StepsList } from './StepsList';
import styles from '../WorkflowManager.module.css';

export default function WorkflowManager() {
    const { actions, positions, isLoadingActions, error, setError } = useWorkflowData();
    
    // Workflow state
    const [workflow, setWorkflow] = useState({
        id: null,
        userID: 1,
        workflowName: '',
        description: '',
        mainCategory: '',
        subCategory: ''
    });

    // Steps state
    const [steps, setSteps] = useState([
        {
            id: null,
            workflow: null,
            position: 1,
            stepName: '',
            description: '',
            roleId: '',
            actions: [{ actionId: '', routeToStep: '' }]
        }
    ]);

    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
    const [isSavingStep, setIsSavingStep] = useState(false);

    const handleWorkflowChange = (field, value) => {
        setWorkflow(prev => ({ ...prev, [field]: value }));
    };

    const handleStepChange = (field, value) => {
        setSteps(prev => prev.map((step, idx) => 
            idx === activeStepIndex 
                ? { ...step, [field]: value }
                : step
        ));
    };

    const handleActionChange = (actionIndex, field, value) => {
        setSteps(prev => prev.map((step, stepIdx) => 
            stepIdx === activeStepIndex 
                ? {
                    ...step,
                    actions: step.actions.map((action, actIdx) =>
                        actIdx === actionIndex 
                            ? { ...action, [field]: value }
                            : action
                    )
                }
                : step
        ));
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
                subCategory: workflow.subCategory
            };

            let savedWorkflow;
            if (workflow.id) {
                savedWorkflow = await workflowAPI.updateWorkflow(workflow.id, workflowData);
            } else {
                savedWorkflow = await workflowAPI.createWorkflow(workflowData);
            }

            setWorkflow(prev => ({ ...prev, id: savedWorkflow.id }));
            alert('Workflow saved successfully!');
        } catch (error) {
            setError('Failed to save workflow');
            console.error('Error saving workflow:', error);
            alert('Failed to save workflow. Please try again.');
        } finally {
            setIsSavingWorkflow(false);
        }
    };

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
                roleId: activeStep.roleId,
                actions: activeStep.actions.filter(action => action.actionId)
            };

            let savedStep;
            if (activeStep.id) {
                savedStep = await workflowAPI.updateStep(activeStep.id, stepData);
            } else {
                savedStep = await workflowAPI.createStep(stepData);
            }

            setSteps(prev => prev.map((step, idx) => 
                idx === activeStepIndex 
                    ? { ...step, id: savedStep.id, ...savedStep }
                    : step
            ));

            alert('Step saved successfully!');
        } catch (error) {
            setError('Failed to save step');
            console.error('Error saving step:', error);
            alert('Failed to save step. Please try again.');
        } finally {
            setIsSavingStep(false);
        }
    };

    const addStep = () => {
        const newStep = {
            id: null,
            workflow: workflow.id,
            position: steps.length + 1,
            stepName: '',
            description: '',
            roleId: '',
            actions: [{ actionId: '', routeToStep: '' }]
        };
        setSteps(prev => [...prev, newStep]);
        setActiveStepIndex(steps.length);
    };

    const addAction = () => {
        setSteps(prev => prev.map((step, idx) => 
            idx === activeStepIndex 
                ? {
                    ...step,
                    actions: [...step.actions, { actionId: '', routeToStep: '' }]
                }
                : step
        ));
    };

    const removeAction = (actionIndex) => {
        setSteps(prev => prev.map((step, idx) => 
            idx === activeStepIndex 
                ? {
                    ...step,
                    actions: step.actions.filter((_, actIdx) => actIdx !== actionIndex)
                }
                : step
        ));
    };

    const activeStep = steps[activeStepIndex] || steps[0];

    if (isLoadingActions) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
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

            <div className={styles.leftPanel}>
                <WorkflowForm
                    workflow={workflow}
                    onWorkflowChange={handleWorkflowChange}
                    onSave={saveWorkflow}
                    isSaving={isSavingWorkflow}
                />

                <StepForm
                    step={activeStep}
                    stepIndex={activeStepIndex}
                    positions={positions}
                    actions={actions}
                    onStepChange={handleStepChange}
                    onActionChange={handleActionChange}
                    onAddAction={addAction}
                    onRemoveAction={removeAction}
                    onSave={saveStep}
                    isSaving={isSavingStep}
                    workflowId={workflow.id}
                />
            </div>

            <StepsList
                steps={steps}
                activeStepIndex={activeStepIndex}
                onStepSelect={setActiveStepIndex}
                onAddStep={addStep}
                isLoading={isSavingStep}
            />
        </div>
    );
}