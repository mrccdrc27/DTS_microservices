import React from "react";

// style
import styles from './pagination.module.css'

// Pagination Component that accepts props
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
}) => {
  // Handle next and previous page change
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className={styles.paginationContainer}>
      <button className={styles.paginationBtn} onClick={handlePrev} disabled={currentPage === 1}>
        {'<'}
      </button>
      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>
      <button className={styles.paginationBtn} onClick={handleNext} disabled={currentPage === totalPages}>
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
