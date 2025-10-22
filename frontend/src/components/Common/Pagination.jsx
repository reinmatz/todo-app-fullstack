import React from 'react';
import './Pagination.css';

const Pagination = ({ pagination, onPrevPage, onNextPage, onGoToPage }) => {
  const { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage } = pagination;

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and surrounding pages
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onGoToPage(page)}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          className="pagination-btn"
          onClick={onNextPage}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
