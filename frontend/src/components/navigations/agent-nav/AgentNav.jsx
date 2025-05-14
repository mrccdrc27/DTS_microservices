import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import styles from './agent-nav.module.css';

// Components
import DateBanner from '../datetime-banner/DateBanner';
import NotifModal from '../../modals/notif-action/NotifModal';
import ProfileModal from '../../modals/profile-action/ProfileModal';

export default function AgentNav() {
  const location = useLocation();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openNotifModal, setOpenNotifModal] = useState(false);

  const handleAvatarClick = () => {
    setOpenProfileModal(prev => !prev);
    setOpenNotifModal(false);
  };

  const handleNotifClick = () => {
    setOpenNotifModal(prev => !prev);
    setOpenProfileModal(false);
  };

  // modal close when the page is resize
  useEffect(() => {
    const handleResize = () => {
      setOpenProfileModal(false); 
      setOpenNotifModal(false);
      setUserMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);

    // clean event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 

  // Burger Menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setUserMenuOpen(false);
  };

  // Three dots Menu
  const [userMenuOpen, setUserMenuOpen] = useState(false); 
  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
    setMenuOpen(false);
    setOpenProfileModal(false); 
    setOpenNotifModal(false);
  };  

  return (
    <>
      {openProfileModal && <ProfileModal />}
      {openNotifModal && <NotifModal />}

      <nav className={styles.navBar}>
        <div className={styles.logoSection}>
          <div className={styles.logoImg}>
            <img src="/logotixx.png" alt="logo" />
          </div>
          <p>TicketFlow</p>
          {/* <span>TickTrack</span> */}
        </div>

        {/* nav-links */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
          <NavLink
            to="/agent"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/agent/ticket"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Ticket
          </NavLink>
          <NavLink
            to="/agent/track"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Track
          </NavLink>
          <NavLink
            to="/agent/archive"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Archive
          </NavLink>
        </div>

         <div className={`${styles.userSection} ${userMenuOpen ? styles.userSectionOpen : ''}`}> {/* className={styles.userSection} */}
            <div className={styles.notifBell} onClick={handleNotifClick}>
              <i className="fa fa-bell"></i>
            </div>
            <img
              className={styles.userAvatar}
              src="https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg"
              alt="Anime Avatar"
              onClick={handleAvatarClick}
            />
            <div className={styles.nameSection}>
              <p className={styles.name}>Username</p>
              <p className={styles.role}>Agent Account</p>
            </div>
        </div> 

         {/* Mobile view */}

         <div className={styles.hamburger} onClick={toggleMenu}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>

        <div className={styles.mobileDots} onClick={toggleUserMenu}>
          <span>⋯</span>
        </div>

      </nav>
      <DateBanner className="agentNav" />
    </>
  );
}
