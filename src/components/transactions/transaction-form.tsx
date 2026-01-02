'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import type { FormState } from '@/lib/actions';
import type { Transaction, Vendor, Category } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Bot, Loader2 } from 'lucide-react';
import { suggestTransactionCategories } from '@/ai/flows/suggest-transaction-categories';
import { Badge } from '../ui/badge';

type TransactionFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialData?: Transaction;
  vendors: Vendor[];
  categories: Category[];
  onFormSuccess?: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Transaction')}
    </Button>
  );
}

export default function TransactionForm({ action, initialData, vendors, categories, onFormSuccess }: TransactionFormProps) {
  const [state, formAction] = useActionState(action, { message: '' });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [description, setDescription] = useState(initialData?.description || '');
  const [vendorId, setVendorId] = useState(initialData?.vendorId || '');
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialData?.categoryId);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      if (onFormSuccess) {
        onFormSuccess();
      }
    }
  }, [state, toast, onFormSuccess]);

  const handleSuggestCategories = () => {
    const vendorName = vendors.find(v => v.id === vendorId)?.name || '';
    if (!description || !vendorName) return;

    startSuggestionTransition(async () => {
      const result = await suggestTransactionCategories({ description, vendor: vendorName });
      
      const validSuggestions = result.suggestedCategories
        .map(suggestedName => {
          const found = categories.find(c => c.name.toLowerCase() === suggestedName.toLowerCase());
          return found;
        })
        .filter((c): c is Category => !!c)
        .map(c => c.id);

      setSuggestedCategories(validSuggestions);
    });
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required />
          {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" defaultValue={initialData?.amount} required />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="e.g. Office lunch" value={description} onChange={(e) => setDescription(e.target.value)} required />
        {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendorId">Vendor</Label>
          <Select name="vendorId" value={vendorId} onValueChange={setVendorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.vendorId && <p className="text-sm text-destructive">{state.errors.vendorId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.categoryId && <p className="text-sm text-destructive">{state.errors.categoryId}</p>}
        </div>
      </div>

       <div className="space-y-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestCategories} disabled={isSuggesting || !description || !vendorId}>
                {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Suggest Category
            </Button>
            {suggestedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {suggestedCategories.map(catId => (
                        <Badge
                            key={catId}
                            variant={selectedCategory === catId ? "default" : "secondary"}
                            onClick={() => setSelectedCategory(catId)}
                            className="cursor-pointer"
                        >
                            {categories.find(c => c.id === catId)?.name}
                        </Badge>
                    ))}
                </div>
            )}
        </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup name="type" defaultValue={initialData?.type ?? 'expense'} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Income</Label>
                </div>
            </RadioGroup>
            {state.errors?.type && <p className="text-sm text-destructive">{state.errors.type}</p>}
          </div>
           <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select name="paymentMode" defaultValue={initialData?.paymentMode ?? 'cash'}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                </Select>
                {state.errors?.paymentMode && <p className="text-sm text-destructive">{state.errors.paymentMode}</p>}
            </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Add any extra details" defaultValue={initialData?.notes} />
      </div>

      {state.message && state.errors && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                {state.message}
            </AlertDescription>
        </Alert>
      )}

      <SubmitButton isEditing={!!initialData} />
    </form>
  );
}
