import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/utils/lib";
// import { cva } from "class-variance-authority";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         destructive:
//           "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//         outline:
//           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost: "hover:bg-accent hover:text-accent-foreground",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-10 px-4 py-2",
//         sm: "h-9 rounded-md px-3",
//         lg: "h-11 rounded-md px-8",
//         icon: "h-10 w-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", !!className && className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "!mx-2 flex flex-col gap-4",
        // caption: "flex justify-center pt-1 relative items-center",
        month_caption:
          "flex justify-center pt-1 relative pointer-events-none items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center",
        // nav_button: cn(
        //   buttonVariants({ variant: "outline" }),
        //   "absolute h-7 w-7 left-1 bg-transparent p-0 opacity-50 hover:opacity-100"
        // ),
        // nav_button_previous: "absolute left-1",

        button_previous: cn(
          // buttonVariants({ variant: "outline" }),
          "size-7 !btn !btn-outline !btn-xs !p-0 absolute top-1 left-2 [&>*]:!fill-secondary disabled:opacity-30 [&>*]:!size-5"
        ),
        // nav_button_next: "absolute right-1",
        button_next:
          "size-7 !btn !btn-outline !btn-xs !p-0 absolute top-1 right-2 [&>*]:!fill-secondary disabled:opacity-30 [&>*]:!size-5",
        // table: "w-full border-collapse space-y-1",
        month_grid: "w-full border-collapse space-y-1",
        // head_row: "flex",
        weekdays: "flex text-secondary",
        // head_cell:
        //   "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        weekday: "rounded-md w-9 font-normal text-[0.8rem]",
        // row: "flex w-full mt-2",
        week: "flex w-full mt-2",
        // cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 text-center flex items-center justify-center text-sm p-0 hover:bg-secondary/60",
        // day: cn(
        //   buttonVariants({ variant: "ghost" }),
        //   "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        // ),
        // day_range_end: "day-range-end",
        range_start: "rounded-l-lg bg-secondary/40",
        range_end: "rounded-r-lg bg-secondary/40",
        // day_selected:
        //   "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // day_today: "bg-accent text-accent-foreground",
        today: "bg-accent rounded-md",
        // day_outside:
        //   "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        outside: "day-outside opacity-50 bg-accent/50 opacity-30",
        // day_disabled: "text-muted-foreground opacity-50",
        disabled: "opacity-50 pointer-events-none",
        // day_range_middle:
        //   "aria-selected:bg-accent aria-selected:text-accent-foreground",
        range_middle: "bg-secondary/15",
        // day_hidden: "invisible",
        hidden: "invisible",
        ...classNames,
      }}
      components={
        {
          // IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          // IconRight: () => <ChevronRight className="h-4 w-4" />,
        }
      }
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
