import { getVendors, getTransactions } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function VendorsPage() {
    const vendors = getVendors();
    const transactions = getTransactions();

    const getVendorStats = (vendorId: string) => {
        const vendorTransactions = transactions.filter(t => t.vendorId === vendorId);
        const totalSpent = vendorTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = vendorTransactions.length;
        return { totalSpent, transactionCount };
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Vendors
                </h1>
                <p className="text-muted-foreground">
                    Manage your vendors and parties.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map(vendor => {
                    const stats = getVendorStats(vendor.id);
                    return (
                        <Card key={vendor.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{vendor.name}</CardTitle>
                                    {vendor.email && <CardDescription>{vendor.email}</CardDescription>}
                                    {vendor.phone && <CardDescription>{vendor.phone}</CardDescription>}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Transactions</span>
                                    <span>{stats.transactionCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Spent</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSpent)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
