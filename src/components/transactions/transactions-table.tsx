'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Vendor, Category } from '@/lib/definitions';
import { DeleteTransactionDialog, EditTransactionSheet } from './buttons';

type TransactionsTableProps = {
  transactions: Transaction[];
  vendors: Vendor[];
  categories: Category[];
};

export default function TransactionsTable({
  transactions,
  vendors,
  categories,
}: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const data = React.useMemo(() => transactions, [transactions]);

  const columns: ColumnDef<Transaction>[] = React.useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'vendorId',
      header: 'Vendor',
      cell: ({ row }) => {
        const vendor = vendors.find(v => v.id === row.getValue('vendorId'));
        return vendor ? vendor.name : 'N/A';
      },
      filterFn: (row, id, value) => {
        const vendor = vendors.find(v => v.id === row.getValue(id));
        return vendor ? vendor.name.toLowerCase().includes(value.toLowerCase()) : false;
      }
    },
    {
      accessorKey: 'categoryId',
      header: 'Category',
      cell: ({ row }) => {
        const category = categories.find(c => c.id === row.getValue('categoryId'));
        return category ? <Badge variant="outline">{category.name}</Badge> : 'N/A';
      },
      filterFn: (row, id, value) => {
        const category = categories.find(c => c.id === row.getValue(id));
        return category ? category.name.toLowerCase().includes(value.toLowerCase()) : false;
      }
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.original.type;
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{type === 'income' ? `+${formatted}` : `-${formatted}`}</div>;
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
       cell: ({ row }) => <div className="capitalize">{row.getValue('type')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditTransactionSheet transaction={transaction} vendors={vendors} categories={categories} />
              <DeleteTransactionDialog transactionId={transaction.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [vendors, categories]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
       <div className="flex items-center py-4">
        <Input
          placeholder="Filter by vendor..."
          value={(table.getColumn('vendorId')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('vendorId')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
