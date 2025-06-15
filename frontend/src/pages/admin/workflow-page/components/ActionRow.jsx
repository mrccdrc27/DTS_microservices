import React from 'react';
import styles from '../WorkflowManager.module.css';

export const ActionRow = ({ 
    action, 
    onActionChange, 
    onRemove, 
    actions, 
    isLoading 
}) => {
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
                    {actions.map(act => (
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
};