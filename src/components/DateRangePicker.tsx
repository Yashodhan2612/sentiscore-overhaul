import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export function DateRangePicker({
  className,
  onDateSelect,
}: DateRangePickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateSelect?.(today);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Earnings Calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-surface-elevated hover:bg-surface border border-border"
            onClick={handleToday}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-surface-elevated hover:bg-surface border border-border"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-4 bg-surface-elevated hover:bg-surface border border-border min-w-[80px]"
            onClick={handleToday}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-surface-elevated hover:bg-surface border border-border"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-surface-elevated",
                isCurrentDay && "bg-primary/10 border-primary text-primary",
                isSelected && !isCurrentDay && "bg-surface-elevated border-border",
                !isCurrentDay && !isSelected && "bg-surface border-border"
              )}
            >
              <span className="text-xs text-muted-foreground mb-1">
                {format(day, "EEE")}
              </span>
              <span className={cn(
                "text-lg font-semibold mb-2",
                isCurrentDay ? "text-primary" : "text-foreground"
              )}>
                {format(day, "MMM d")}
              </span>
              <div className="text-xs text-muted-foreground">
                No Calls
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
