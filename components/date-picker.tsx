"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm px-3 py-2 h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="truncate">
            {date ? format(date, "MMM d, yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50" align="start" side="bottom" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="rounded-md border-0"
        />
      </PopoverContent>
    </Popover>
  )
}
