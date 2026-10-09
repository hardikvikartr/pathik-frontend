import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-xl p-4 px-6 shadow-sm flex flex-wrap justify-between items-center gap-4 mt-6">
      <div className="text-sm text-pathik-text-light">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>
      <div className="flex gap-2 items-center">
        <button
          className="py-2 px-3 border-2 border-pathik-border bg-white text-pathik-text-dark rounded-md cursor-pointer transition-all duration-300 font-semibold text-sm min-w-[36px] text-center hover:border-pathik-primary hover:text-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-pathik-border disabled:hover:text-pathik-text-dark"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
        <button
          className="py-2 px-3 border-2 border-pathik-border bg-white text-pathik-text-dark rounded-md cursor-pointer transition-all duration-300 font-semibold text-sm min-w-[36px] text-center hover:border-pathik-primary hover:text-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-pathik-border disabled:hover:text-pathik-text-dark"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <i className="fas fa-angle-left"></i>
        </button>
        <button className="py-2 px-3 border-2 border-pathik-primary bg-pathik-primary text-white rounded-md cursor-pointer font-semibold text-sm min-w-[36px] text-center">
          {currentPage}
        </button>

        <button
          className="py-2 px-3 border-2 border-pathik-border bg-white text-pathik-text-dark rounded-md cursor-pointer transition-all duration-300 font-semibold text-sm min-w-[36px] text-center hover:border-pathik-primary hover:text-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-pathik-border disabled:hover:text-pathik-text-dark"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-angle-right"></i>
        </button>
        <button
          className="py-2 px-3 border-2 border-pathik-border bg-white text-pathik-text-dark rounded-md cursor-pointer transition-all duration-300 font-semibold text-sm min-w-[36px] text-center hover:border-pathik-primary hover:text-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-pathik-border disabled:hover:text-pathik-text-dark"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  );
}
