import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function Pagination({
  page = 0,
  totalPages = 1,
  totalElements = 0,
  hasNext = false,
  hasPrevious = false,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const canGoPrevious = page > 0 && (hasPrevious !== undefined ? hasPrevious : true);
  const canGoNext = page < totalPages - 1 && (hasNext !== undefined ? hasNext : true);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      const left = Math.max(1, page - 1);
      const right = Math.min(totalPages - 2, page + 1);

      if (left > 1) {
        pages.push('dots-left');
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 2) {
        pages.push('dots-right');
      }

      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 text-sm text-slate-600', className)}>
      <div>
        Showing page <span className="font-semibold text-slate-900">{page + 1}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
        {totalElements > 0 && (
          <span className="text-slate-400 ml-1">({totalElements} total items)</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => {
            if (canGoPrevious) {
              onPageChange(page - 1);
            }
          }}
          icon={ChevronLeft}
          className="cursor-pointer"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={`${p}-${idx}`} className="px-2 py-1 text-slate-400 font-bold select-none text-xs">
                  ...
                </span>
              );
            }
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft-xs border border-brand-600'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${p + 1}`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => {
            if (canGoNext) {
              onPageChange(page + 1);
            }
          }}
          className="cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
