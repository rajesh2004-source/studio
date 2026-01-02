'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateReportSummary } from '@/ai/flows/generate-ai-summaries';
import { Bot, Download, Loader2 } from 'lucide-react';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type ReportGeneratorProps = {
  transactions: Transaction[];
  categories: Category[];
  vendors: Vendor[];
};

export default function ReportGenerator({
  transactions,
  categories,
  vendors,
}: ReportGeneratorProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryId, setCategoryId] = useState<string>('all');
  const [vendorId, setVendorId] = useState<string>('all');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Auto-generate report on initial load and when filters change
  useEffect(() => {
    handleGenerateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, dateRange, categoryId, vendorId]);


  const filteredTransactions = useMemo(() => {
    if (!reportGenerated) {
        return [];
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      let isDateInRange = true;
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0); // Start of the day
        if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999); // End of the day
            isDateInRange = transactionDate >= fromDate && transactionDate <= toDate;
        } else {
            isDateInRange = transactionDate.toDateString() === fromDate.toDateString();
        }
      }
      
      const isCategoryMatch = categoryId === 'all' || t.categoryId === categoryId;
      const isVendorMatch = vendorId === 'all' || t.vendorId === vendorId;

      return isDateInRange && isCategoryMatch && isVendorMatch;
    });
  }, [reportGenerated, transactions, dateRange, categoryId, vendorId]);


  const handleGenerateReport = () => {
    setReportGenerated(true);
    setSummary(''); 
  };

  const handleGenerateSummary = async () => {
    if (filteredTransactions.length === 0) return;
    setIsLoading(true);
    setSummary('');
    const reportData = JSON.stringify(
      filteredTransactions.map(t => ({
        ...t,
        category: getCategoryName(t.categoryId),
        vendor: getVendorName(t.vendorId),
      })),
      null,
      2
    );
    try {
      const result = await generateReportSummary({ reportData });
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary('Sorry, I was unable to generate a summary for this report.');
    }
    setIsLoading(false);
  };

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name;
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name;

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs. ${formatted}`;
  };

  const formatCurrencyWithType = (amount: number, type: 'income' | 'expense') => {
    const formatted = formatCurrency(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  }


  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ['Date', 'Description', 'Category', 'Vendor', 'Amount'];
    const tableRows: any[] = [];

    let totalInflow = 0;
    let totalOutflow = 0;

    filteredTransactions.forEach(ticket => {
      const ticketData = [
        new Date(ticket.date).toLocaleDateString(),
        ticket.description,
        getCategoryName(ticket.categoryId) || 'N/A',
        getVendorName(ticket.vendorId) || 'N/A',
        formatCurrencyWithType(ticket.amount, ticket.type),
      ];
      tableRows.push(ticketData);

      if (ticket.type === 'income') {
        totalInflow += ticket.amount;
      } else {
        totalOutflow += ticket.amount;
      }
    });

    const dateRangeStr =
      dateRange?.from
        ? dateRange.to
          ? `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(
              dateRange.to
            ).toLocaleDateString()}`
          : `From ${new Date(dateRange.from).toLocaleDateString()}`
        : 'All dates';

    doc.setFontSize(18);
    doc.text('Petty Cash Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date Range: ${dateRangeStr}`, 14, 30);
    if (categoryId !== 'all')
      doc.text(`Category: ${getCategoryName(categoryId)}`, 14, 36);
    if (vendorId !== 'all')
      doc.text(`Vendor: ${getVendorName(vendorId)}`, 14, 42);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      headStyles: { fillColor: [41, 128, 185] },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.text(
      `Total Inflow: ${formatCurrency(totalInflow)}`,
      14,
      finalY + 10
    );
    doc.text(
      `Total Outflow: ${formatCurrency(totalOutflow)}`,
      14,
      finalY + 18
    );
    doc.text(
      `Net Flow: ${formatCurrency(totalInflow - totalOutflow)}`,
      14,
      finalY + 26
    );

    if (summary) {
        const summaryY = finalY + 40;
        // Check if there is enough space, otherwise add a new page
        if (summaryY > 250) {
            doc.addPage();
            doc.setFontSize(18);
            doc.text("AI Summary", 14, 22);
            doc.setFontSize(12);
            const splitSummary = doc.splitTextToSize(summary, 180);
            doc.text(splitSummary, 14, 30);
        } else {
            doc.setFontSize(14);
            doc.text("AI Summary", 14, summaryY - 5);
            doc.setFontSize(10);
            const splitSummary = doc.splitTextToSize(summary, 180);
            doc.text(splitSummary, 14, summaryY);
        }
    }

    doc.save(`PettyCash_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Select criteria to generate your report. The report will update automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DateRangePicker onUpdate={range => setDateRange(range.range)} />
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setVendorId} value={vendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button onClick={handleGenerateReport} className="w-full">
              Refresh Report
            </Button>
          </CardContent>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Generated Report</CardTitle>
                <CardDescription>
                {reportGenerated
                    ? `Showing ${filteredTransactions.length} transactions.`
                    : 'No report generated yet.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {reportGenerated && filteredTransactions.length > 0 ? (
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
                        <TableCell>
                            {new Date(t.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell>
                            <Badge variant="outline">
                            {getCategoryName(t.categoryId) ?? 'N/A'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {getVendorName(t.vendorId) ?? 'N/A'}
                        </TableCell>
                        <TableCell
                            className={`text-right font-medium ${
                            t.type === 'income'
                                ? 'text-green-600 dark:text-green-500'
                                : 'text-red-600 dark:text-red-500'
                            }`}
                        >
                            {formatCurrencyWithType(t.amount, t.type)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>{reportGenerated ? 'No transactions found for the selected filters.' : 'Your generated report will appear here.'}</p>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            {reportGenerated && (
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Bot size={20} /> AI Summary & Export
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={filteredTransactions.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                    </Button>
                </CardTitle>
                <CardDescription>
                    Generate an AI analysis or download the report.
                </CardDescription>
                </CardHeader>
                <CardContent>
                {summary && <p className="text-sm border-l-2 pl-4 italic">{summary}</p>}
                {isLoading && (
                    <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                    </div>
                )}
                {!summary && !isLoading && (
                    <p className="text-sm text-muted-foreground">
                    Click below to generate a summary for the {filteredTransactions.length} transactions.
                    </p>
                )}
                <Button
                    onClick={handleGenerateSummary}
                    className="w-full mt-4"
                    disabled={isLoading || filteredTransactions.length === 0}
                >
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Bot className="mr-2 h-4 w-4" />
                    )}
                    {summary ? 'Regenerate Summary' : 'Generate Summary'}
                </Button>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}
