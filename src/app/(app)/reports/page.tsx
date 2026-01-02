'use client';

import { getTransactions, getCategories, getVendors } from "@/lib/data";
import ReportGenerator from "@/components/reports/report-generator";
import type { Transaction, Category, Vendor } from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
    const [data, setData] = useState<{
        transactions: Transaction[];
        categories: Category[];
        vendors: Vendor[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [transactions, categories, vendors] = await Promise.all([
                getTransactions(),
                getCategories(),
                getVendors(),
            ]);
            setData({ transactions, categories, vendors });
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Reports
                </h1>
                <p className="text-muted-foreground">
                    Generate reports and get AI-powered insights.
                </p>
            </div>
            {loading || !data ? (
                <div className="space-y-8">
                    <CardSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2">
                           <TableSkeleton />
                        </div>
                         <div className="lg:col-span-1 space-y-6">
                            <CardSkeleton />
                        </div>
                    </div>
                </div>
            ) : (
                <ReportGenerator 
                    transactions={data.transactions} 
                    categories={data.categories} 
                    vendors={data.vendors} 
                />
            )}
        </div>
    );
}

const CardSkeleton = () => (
    <div className="space-y-4 p-6 border rounded-lg">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

const TableSkeleton = () => (
    <div className="space-y-4 p-6 border rounded-lg">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
)
