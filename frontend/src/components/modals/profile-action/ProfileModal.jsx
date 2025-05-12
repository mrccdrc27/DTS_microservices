import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile-modal.module.css'; 

export default function ProfileModal() {

  const navigate = useNavigate();

  const handleView = () => {
    navigate('/agent/profile');
  };

  return (
    <main className={styles.profileModalPage}>
      <div className={styles.pmNameSection}>
        <div className={styles.pmPicture}></div>
        <div className={styles.pmName}>
          <span>Username</span>
          <span>email@gmail.com</span>
        </div>
      </div>
      <div className={styles.pmAccSection} onClick={handleView}>
        <div className={styles.pmIcon}>
          <i className="fa fa-cog"></i>
        </div>
        <span>Account Settings</span>
      </div>
      <div className={styles.pmLogoutSection}>
        <div className={styles.pmIcon}>
          <i className="fa fa-sign-out"></i>
        </div>
        <span>Log out</span>
      </div>
    </main>
  );
}
