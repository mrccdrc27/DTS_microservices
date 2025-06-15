import React from 'react';
import { StepCard } from './stepcard.jsx';
import styles from '../WorkflowManager.module.css';

export const StepsList = ({ 
    steps, 
    activeStepIndex, 
    onStepSelect, 
    onAddStep, 
    isLoading 
}) => {
    return (
        <div className={styles.rightPanel}>
            <div className={styles.stepSection}>
                <div className={styles.header}>
                    <h3>Workflow Steps</h3>
                    <button 
                        className={styles.addButton}
                        onClick={onAddStep}
                        disabled={isLoading}
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
                            onClick={() => onStepSelect(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};