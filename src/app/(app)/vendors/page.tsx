import { getVendors, getTransactions, getCategories } from "@/lib/data";
import VendorList from "@/components/vendors/vendor-list";
import { CreateVendorButton } from "@/components/vendors/buttons";

export default async function VendorsPage() {
    const vendors = await getVendors();
    const transactions = await getTransactions();
    const categories = await getCategories();

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Vendors
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your vendors and parties.
                    </p>
                </div>
                <CreateVendorButton />
            </div>
            <VendorList vendors={vendors} transactions={transactions} categories={categories} />
        </div>
    );
}
