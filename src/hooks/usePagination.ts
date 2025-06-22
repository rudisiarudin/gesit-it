import { useEffect, useState } from 'react';

export const usePagination = (totalItems: number, itemsPerPage: number = 10) => {
  // Prevent invalid values
  const validItemsPerPage = itemsPerPage < 1 ? 1 : itemsPerPage;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / validItemsPerPage);

  // Pastikan currentPage tidak melebihi total halaman
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  // Dapatkan item sesuai halaman sekarang
  const paginatedItems = <T,>(items: T[]) =>
    items.slice(
      (currentPage - 1) * validItemsPerPage,
      currentPage * validItemsPerPage
    );

  // Navigasi halaman
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    itemsPerPage: validItemsPerPage,
  };
};
