import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  const showPages = 5;

  if (totalPages <= showPages + 2) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 2, currentPage + 1);

    if (currentPage < 3) {
      end = Math.min(totalPages - 2, 3);
    }

    if (currentPage > totalPages - 4) {
      start = Math.max(1, totalPages - 4);
    }

    if (start > 1) pages.push('ellipsis');

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages - 2) pages.push('ellipsis');

    pages.push(totalPages - 1);
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => onPageChange(page)}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
