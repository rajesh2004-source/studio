'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import type { Vendor } from '@/lib/definitions';
import VendorForm from './vendor-form';
import { createVendor, deleteVendor, updateVendor } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';


export function CreateVendorButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Vendor</SheetTitle>
          <SheetDescription>
            Add a new vendor or party to your records. Click create when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <VendorForm action={createVendor} onFormSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EditVendorSheet({ vendor }: { vendor: Vendor }) {
    const [open, setOpen] = useState(false);
    const updateVendorWithId = updateVendor.bind(null, vendor.id);

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
                    <SheetTitle>Edit Vendor</SheetTitle>
                    <SheetDescription>
                        Update the vendor details. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                 <div className="mt-4">
                    <VendorForm 
                        action={updateVendorWithId} 
                        initialData={vendor}
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

export function DeleteVendorDialog({ vendorId, hasTransactions }: { vendorId: string, hasTransactions: boolean }) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (hasTransactions) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: "Cannot delete vendor with associated transactions.",
        });
        return;
    }
    const result = await deleteVendor(vendorId);
    if (result?.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
         <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-50 focus:text-red-600" disabled={hasTransactions}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the vendor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form action={handleDelete}>
            <DeleteButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
