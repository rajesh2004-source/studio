'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DateRangePickerProps = {
  onUpdate: (values: { range: DateRange }) => void;
  initialDateFrom?: string | number | Date;
  initialDateTo?: string | number | Date;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  showCompare?: boolean;
};

export function DateRangePicker({
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = 'end',
  locale = 'en-US',
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: initialDateFrom ? new Date(initialDateFrom) : undefined,
    to: initialDateTo ? new Date(initialDateTo) : undefined,
  });

  const onUpdateRange = (newRange: DateRange) => {
    setRange(newRange);
    onUpdate({ range: newRange });
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !range && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, 'LLL dd, y')} -{' '}
                  {format(range.to, 'LLL dd, y')}
                </>
              ) : (
                format(range.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onUpdateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
