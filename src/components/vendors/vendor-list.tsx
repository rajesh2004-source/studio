'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EditVendorSheet, DeleteVendorDialog } from "./buttons";
import type { Category, Transaction, Vendor } from "@/lib/definitions";

type VendorListProps = {
    vendors: Vendor[];
    transactions: Transaction[];
    categories: Category[];
}

export default function VendorList({ vendors, transactions, categories }: VendorListProps) {
    
    const getVendorStats = (vendorId: string) => {
        const vendorTransactions = transactions.filter(t => t.vendorId === vendorId);
        const totalSpent = vendorTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalEarned = vendorTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = vendorTransactions.length;
        return { totalSpent, totalEarned, transactionCount, transactions: vendorTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
    }

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map(vendor => {
                const stats = getVendorStats(vendor.id);
                return (
                    <Card key={vendor.id}>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{vendor.name}</CardTitle>
                                    {vendor.email && <CardDescription>{vendor.email}</CardDescription>}
                                    {vendor.phone && <CardDescription>{vendor.phone}</CardDescription>}
                                    {vendor.contactPerson && <CardDescription className="text-xs">Contact: {vendor.contactPerson}</CardDescription>}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <EditVendorSheet vendor={vendor} />
                                    <DropdownMenuSeparator />
                                    <DeleteVendorDialog vendorId={vendor.id} hasTransactions={stats.transactionCount > 0} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Transactions</span>
                                <span>{stats.transactionCount}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Earned</span>
                                <span className="font-medium text-green-600 dark:text-green-500">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalEarned)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span className="font-medium text-red-600 dark:text-red-500">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalSpent)}
                                </span>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="px-0 h-auto text-primary text-sm mt-2" disabled={stats.transactionCount === 0}>View Transactions</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <DialogHeader>
                                        <DialogTitle>Transaction History: {vendor.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[60vh] overflow-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stats.transactions.length > 0 ? stats.transactions.map(t => (
                                                    <TableRow key={t.id}>
                                                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                                        <TableCell>{t.description}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{getCategoryName(t.categoryId) ?? 'N/A'}</Badge>
                                                        </TableCell>
                                                        <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                                            {t.type === 'income' ? '+' : '-'}
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center">No transactions found.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
