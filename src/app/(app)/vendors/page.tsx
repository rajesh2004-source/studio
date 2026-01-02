import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorsPage() {
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
            <Card>
                <CardHeader>
                    <CardTitle>All Vendors</CardTitle>
                    <CardDescription>Feature coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is where the vendor data table and management tools will be.</p>
                </CardContent>
            </Card>
        </div>
    );
}
