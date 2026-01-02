'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createTransaction, editTransaction, deleteTransactionAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import TransactionForm from './transaction-form';
import type { Transaction, Vendor, Category } from '@/lib/definitions';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export function CreateTransactionButton({ vendors, categories }: { vendors: Vendor[], categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>
            Record a new income or expense. Click create when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <TransactionForm action={createTransaction} vendors={vendors} categories={categories} onFormSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EditTransactionSheet({ transaction, vendors, categories }: { transaction: Transaction, vendors: Vendor[], categories: Category[] }) {
    const [open, setOpen] = useState(false);
    const editTransactionWithId = editTransaction.bind(null, transaction.id);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Edit Transaction</SheetTitle>
                    <SheetDescription>
                        Update the transaction details. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                 <div className="mt-4">
                    <TransactionForm 
                        action={editTransactionWithId} 
                        initialData={transaction} 
                        vendors={vendors} 
                        categories={categories}
                        onFormSuccess={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="destructive" type="submit" disabled={pending}>
             {pending ? 'Deleting...' : 'Delete'}
        </Button>
    )
}

export function DeleteTransactionDialog({ transactionId }: { transactionId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
         <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-50 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the transaction.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form action={async () => await deleteTransactionAction(transactionId)}>
            <DeleteButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
