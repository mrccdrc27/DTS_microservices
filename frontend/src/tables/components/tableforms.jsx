import styles from './tableforms.module.css'
import form from './general-form.module.css'

export function Pagination({ currentPage, totalPages, setCurrentPage }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
      <div className={styles.paginationControls} style={{ display: 'flex', gap: '8px' }}>
          <button
              className={`${form.circlebutton} ${form.btn}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
          >
              {'<'}
          </button>

          {pages.map((page) => (
              <button
                  key={page}
                  className={`${form.circlebutton} ${form.btn} ${currentPage === page ? styles.activePage : ''}`}
                  onClick={() => setCurrentPage(page)}
                  style={{
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontWeight: currentPage === page ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      backgroundColor: currentPage === page ? '#007bff' : 'transparent',
                      color: currentPage === page ? '#fff' : '#000',
                  }}
                  onMouseEnter={(e) => {
                      if (currentPage !== page) e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                      if (currentPage !== page) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
              >
                  {page}
              </button>
          ))}

          <button
              className={`${form.circlebutton} ${form.btn}`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
          >
              {'>'}
          </button>
      </div>
  );
}

export function RecentTask (props) {
    return (
        <>
        <div className={styles.RecentTaskItem}>
            <div className={styles.wrapper3}>
                <div className={styles.RecentTaskAccent}></div>
            </div>
            <div className={styles.wrapper4}>
                <span className={styles.text}>dd/mm/yy</span>
                <span className={styles.text}>{props.text}</span>
            </div>

        </div>
        </>
    )
}

// Non-functional Props
export function SearchBar({ onSearch }) {
  return (
    <div className={form.FormContainer}>
      <div className={form.SearchBarContainer}>
        <i className="fas fa-search" style={{ paddingRight: '10px' }}></i>
        <input
          className={form.SearchBar}
          type="text"
          placeholder="Search by ticket ID or keywords..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export function Dropdown(props) {
    return(
        <>
        <div className={styles.filters}>
            <p>{props.title}</p>
            <select 
            className={form.dropdown}
            id="time-period">
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="all-time">All Time</option>
            </select>
        </div>
    </>
    )
}

export function AgentStatus({ status }) {
    const normalizedStatus = status?.toLowerCase();
  
    const greenStatuses = ['active', 'closed', 'resolved'];
    const grayStatuses = ['pending', 'inactive'];
    const redStatuses = ['suspended', 'escalated', 'disabled', 'cancelled'];
    const orangeStatuses = ['reopened'];
  
    let bgColor = '#E0F7EF';
    let textColor = '#2E7D32';
    let iconClass = 'fa-solid fa-circle-check';
  
    if (grayStatuses.includes(normalizedStatus)) {
      bgColor = '#ECECEC';
      textColor = '#424242';
      iconClass = 'fa-solid fa-circle-pause';
    } else if (redStatuses.includes(normalizedStatus)) {
      bgColor = '#FFE5E5';
      textColor = '#C62828';
      iconClass = 'fa-solid fa-circle-exclamation';
    } else if (orangeStatuses.includes(normalizedStatus)) {
      bgColor = '#FFF3E0';
      textColor = '#FF6F00';
      iconClass = 'fa-solid fa-rotate-right';
    }
  
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: '20px',
          padding: '6px 12px',
          fontWeight: '500',
          fontSize: '0.875rem',
          textTransform: 'capitalize',
          width: 'fit-content',
          boxShadow: '0 0 4px rgba(0,0,0,0.05)'
        }}
      >
        <i className={iconClass}></i>
        {normalizedStatus}
      </div>
    );
  }
  

