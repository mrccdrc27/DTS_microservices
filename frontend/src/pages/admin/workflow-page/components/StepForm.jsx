import React from 'react';
import { ActionRow } from './ActionRow';
import styles from '../WorkflowManager.module.css';

export const StepForm = ({ 
    step, 
    stepIndex, 
    positions,
    actions,
    onStepChange, 
    onActionChange,
    onAddAction,
    onRemoveAction,
    onSave, 
    isSaving,
    workflowId 
}) => {
    return (
        <div className={styles.stepSection}>
            <div className={styles.header}>
                <h3>
                    Configure Step {stepIndex + 1}
                    {step?.stepName && `: ${step.stepName}`}
                </h3>
                <button 
                    className={styles.button}
                    onClick={onSave}
                    disabled={isSaving || !workflowId}
                >
                    {isSaving ? 'Saving...' : 'Save Step'}
                </button>
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Step Name</label>
                    <input 
                        className={styles.input}
                        type="text" 
                        value={step?.stepName || ''}
                        onChange={(e) => onStepChange('stepName', e.target.value)}
                        placeholder="Enter step name"
                        disabled={isSaving}
                    />
                </div>
                <div className={styles.formGroupSmall}>
                    <label className={styles.label}>Role</label>
                    <select
                        className={styles.input}
                        value={step?.roleId || ''}
                        onChange={(e) => onStepChange('roleId', e.target.value)}
                        disabled={isSaving}
                    >
                        <option value="">Select a position</option>
                        {positions.map(pos => (
                            <option key={pos.id} value={pos.id}>
                                {pos.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                    className={styles.textarea}
                    value={step?.description || ''}
                    onChange={(e) => onStepChange('description', e.target.value)}
                    placeholder="Describe what happens in this step"
                    disabled={isSaving}
                />
            </div>

            <div>
                <label className={styles.label}>Actions</label>
                <div className={styles.actionContainer}>
                    {step?.actions?.map((action, index) => (
                        <ActionRow
                            key={index}
                            action={action}
                            onActionChange={(value) => onActionChange(index, 'actionId', value)}
                            onRemove={() => onRemoveAction(index)}
                            actions={actions}
                            isLoading={isSaving}
                        />
                    ))}
                    <button 
                        className={styles.addButton}
                        onClick={onAddAction}
                        disabled={isSaving}
                    >
                        <span>+</span> Add Another Action
                    </button>
                </div>
            </div>
        </div>
    );
};