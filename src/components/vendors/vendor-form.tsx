'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import type { FormState } from '@/lib/actions';
import type { Vendor } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type VendorFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialData?: Vendor;
  onFormSuccess?: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Vendor')}
    </Button>
  );
}

export default function VendorForm({ action, initialData, onFormSuccess }: VendorFormProps) {
  const [state, formAction] = useActionState(action, { message: '' });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
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

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Vendor Name" defaultValue={initialData?.name} required />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person (Optional)</Label>
        <Input id="contactPerson" name="contactPerson" placeholder="John Doe" defaultValue={initialData?.contactPerson} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input id="email" name="email" type="email" placeholder="contact@vendor.com" defaultValue={initialData?.email} />
         {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input id="phone" name="phone" placeholder="555-123-4567" defaultValue={initialData?.phone} />
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
