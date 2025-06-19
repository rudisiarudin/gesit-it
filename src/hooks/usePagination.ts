import { useState } from 'react';

export const usePagination = (totalItems: number, itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = <T,>(items: T[]) =>
    items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
  };
};
