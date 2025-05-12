import {NavLink} from 'react-router-dom'
import { useState } from 'react'; 

import styles from "./admin-nav.module.css";
import DateBanner from '../datetime-banner/DateBanner';


export default function AdminNav() {

  // pa remove nalang if di need
    const handleAvatarClick = () => {
      setOpenProfileModal(prevState => !prevState)
      setOpenNotifModal(false); // close notif modal if open
    }

    const handleNotifClick = () => {
      setOpenNotifModal(prev => !prev);
      setOpenProfileModal(false); // close profile modal if open
    };

    // pa remove nalang if di need


      // state for menu bar
    const [menuOpen, setMenuOpen] = useState(false); 

    const toggleMenu = () => {
      setMenuOpen(!menuOpen); 
    };

  return(
    <>
        <nav className={styles.navBar}> 
      <div className={styles.logoSection}> 
        <div className={styles.logoImg}></div>
        <span>DTS</span>
      </div>

      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>

      {/* nav-links */}
      <div className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <NavLink
          to="/admin"
          end
          className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Dashboard</NavLink>
        <NavLink
          to="/admin/agent"
          className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Agent</NavLink>
        <NavLink
          to="/admin/workflow"
          className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Workflow</NavLink>
        <NavLink
          to="/admin/archive"
          className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Archive</NavLink>
      </div>

      <div className={styles.userSection}>
        <p>Username</p>
        <div className={styles.notifBell} onClick={handleNotifClick}>
          <i className="fa fa-bell"></i>
        </div>
        <img className={styles.userAvatar} src="https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg" alt="Anime Avatar"onClick={handleAvatarClick}></img>
      </div>
    </nav>
    <DateBanner className="adminNav"/>
    </>
  )
}