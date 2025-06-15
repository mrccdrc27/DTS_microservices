import React from 'react';
import styles from '../WorkflowManager.module.css';

export const WorkflowForm = ({ 
    workflow, 
    onWorkflowChange, 
    onSave, 
    isSaving 
}) => {
    return (
        <div className={styles.workflowSection}>
            <div className={styles.header}>
                <h2>Workflow Configuration</h2>
                <button 
                    className={styles.button}
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Workflow'}
                </button>
            </div>
            
            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Workflow Name</label>
                    <input 
                        className={styles.input}
                        type="text" 
                        value={workflow.workflowName}
                        onChange={(e) => onWorkflowChange('workflowName', e.target.value)}
                        placeholder="Enter workflow name"
                        disabled={isSaving}
                    />
                </div>
                <div className={styles.formGroupSmall}>
                    <label className={styles.label}>Main Category</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={workflow.mainCategory}
                        onChange={(e) => onWorkflowChange('mainCategory', e.target.value)}
                        placeholder="Enter Category"
                        disabled={isSaving}
                    />
                </div>
                <div className={styles.formGroupSmall}>
                    <label className={styles.label}>Sub Category</label>
                    <input 
                        className={styles.input}
                        type="text" 
                        value={workflow.subCategory}
                        onChange={(e) => onWorkflowChange('subCategory', e.target.value)}
                        placeholder="Sub category"
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                    className={styles.textarea}
                    value={workflow.description}
                    onChange={(e) => onWorkflowChange('description', e.target.value)}
                    placeholder="Describe the workflow purpose and process"
                    disabled={isSaving}
                />
            </div>
        </div>
    );
};