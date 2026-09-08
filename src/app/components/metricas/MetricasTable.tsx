/**
 * MetricasTable - Tabela de Dados
 * Módulo de Métricas - UNIQ Empresas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

/** Coluna da tabela */
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface MetricasTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  loading?: boolean;
  className?: string;
  pageSize?: number;
}

/**
 * Componente de Tabela de Métricas
 * Suporta ordenação e paginação
 */
export function MetricasTable({
  columns,
  data,
  loading = false,
  className,
  pageSize = 10,
}: MetricasTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  // Ordena dados
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Paginação
  const paginatedData = sortedData.slice(
    page * pageSize,
    (page + 1) * pageSize
  );
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Manipulador de ordenação
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-0">
          <div className="animate-pulse">
            {/* Cabeçalho */}
            <div className="grid gap-4 border-b bg-muted p-4">
              {columns.map((col) => (
                <div key={col.key} className="h-4 w-full rounded bg-muted" />
              ))}
            </div>
            {/* Linhas */}
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="grid gap-4 border-b p-4"
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className="h-4 w-full rounded bg-muted"
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-0">
        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho */}
            <thead className="border-b bg-muted">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                      col.sortable && 'cursor-pointer hover:bg-muted',
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.title}
                      {col.sortable && (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corpo */}
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b transition-colors hover:bg-muted"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages} ({sortedData.length} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricasTable;