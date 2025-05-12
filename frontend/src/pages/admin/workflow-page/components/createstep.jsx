import { useState } from 'react';
import styles from './createstep.module.css';


function ActionRow() {
    return (
        <div className={styles.row}>
            <div className={styles.form}>
                <p>Action Name</p>
                <input type="text" className={styles.input} />
            </div>
            <div className={styles.formDropdown}>
                <p>Route</p>
                <select className={styles.dropdown}></select>
            </div>
        </div>
    );
}


export default function CreateStep() {
    const [actions, setActions] = useState([{ name: '', route: '' }]);

    const handleAddAction = () => {
        setActions([...actions, { name: '', route: '' }]);
    };

    return (
        <>
            <div className={styles.steps}>
                <h1>Configure Steps</h1>
                <div className={styles.row}>
                    <div className={styles.form}>
                        <p>Step Name</p>
                        <input type="text" className={styles.input} />
                    </div>
                    <div className={styles.formDropdown}>
                        <p>Role</p>
                        <select className={styles.dropdown}></select>
                    </div>
                </div>

                <div>
                    <p>Description</p>
                    <input type="text" className={styles.input} />
                </div>

                <div>
                    <p>Instruction</p>
                    <input type="text" className={styles.input} />
                </div>

                <div>
                    <p>Actions</p>
                    <div className={styles.actionContainer}>
                        {actions.map((_, index) => (
                            <ActionRow key={index} />
                        ))}
                        <button
                            type="button"
                            className={styles.button}
                            onClick={handleAddAction}
                        >
                            <i className="fa-solid fa-plus"></i> Add Another Action
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
