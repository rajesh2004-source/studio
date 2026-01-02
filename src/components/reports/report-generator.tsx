'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateReportSummary } from '@/ai/flows/generate-ai-summaries';
import { Bot, Loader2 } from 'lucide-react';
import { Category, Transaction, Vendor } from '@/lib/definitions';
import { DateRange } from 'react-day-picker';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ReportGeneratorProps = {
  transactions: Transaction[];
  categories: Category[];
  vendors: Vendor[];
};

export default function ReportGenerator({ transactions, categories, vendors }: ReportGeneratorProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryId, setCategoryId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const handleGenerateReport = () => {
    let filtered = transactions;

    if (dateRange?.from && dateRange?.to) {
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= dateRange.from! && transactionDate <= dateRange.to!;
        });
    }

    if (categoryId) {
        filtered = filtered.filter(t => t.categoryId === categoryId);
    }
    
    if (vendorId) {
        filtered = filtered.filter(t => t.vendorId === vendorId);
    }

    setFilteredTransactions(filtered);
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    const reportData = JSON.stringify(filteredTransactions, null, 2);
    try {
      const result = await generateReportSummary({ reportData });
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary('Sorry, I was unable to generate a summary for this report.');
    }
    setIsLoading(false);
  };
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name;
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>Select criteria to generate your report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DateRangePicker onUpdate={(range) => setDateRange(range.range)} />
                    <Select onValueChange={setCategoryId} value={categoryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={setVendorId} value={vendorId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Vendors</SelectItem>
                            {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReport} className="w-full">Generate Report</Button>
                </CardContent>
            </Card>

            {filteredTransactions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot size={20} /> AI Summary
                        </CardTitle>
                        <CardDescription>An AI-generated analysis of the report data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {summary && <p className="text-sm">{summary}</p>}
                        {isLoading && (
                            <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </div>
                        )}
                        {!summary && !isLoading && <p className="text-sm text-muted-foreground">Click below to generate a summary.</p>}
                        <Button onClick={handleGenerateSummary} className="w-full mt-4" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            {summary ? 'Regenerate Summary' : 'Generate Summary'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Generated Report</CardTitle>
                     <CardDescription>
                        {filteredTransactions.length > 0
                            ? `Showing ${filteredTransactions.length} transactions.`
                            : "No transactions match the selected filters."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {filteredTransactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{getCategoryName(t.categoryId) ?? 'N/A'}</Badge>
                                    </TableCell>
                                     <TableCell>{getVendorName(t.vendorId) ?? 'N/A'}</TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <p>Your generated report will appear here.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
