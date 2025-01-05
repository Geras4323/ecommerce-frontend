import { cn } from "@/utils/lib";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

const Dropdown = RadixDropdown.Root;
const DropdownPortal = RadixDropdown.Portal;
const DropdownSeparator = RadixDropdown.Separator;
const DropdownSub = RadixDropdown.Sub;

const DropdownTrigger = forwardRef<
  ElementRef<typeof RadixDropdown.Trigger>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Trigger>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Trigger
      ref={ref}
      className={cn(
        !!props.className && props.className,
        "w-fit data-[state=open]:rounded-b-none"
      )}
      // {...props}
    >
      {children}
    </RadixDropdown.Trigger>
  );
});
DropdownTrigger.displayName = RadixDropdown.Trigger.displayName;

const DropdownContent = forwardRef<
  ElementRef<typeof RadixDropdown.Content>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Content>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Content
      ref={ref}
      className={cn(
        !!props.className && props.className,
        "z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden data-[state=open]:rounded-b-lg"
      )}
      // {...props}
    >
      {children}
    </RadixDropdown.Content>
  );
});
DropdownContent.displayName = RadixDropdown.Content.displayName;

const DropdownArrow = forwardRef<
  ElementRef<typeof RadixDropdown.Arrow>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Arrow>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Arrow ref={ref} {...props}>
      {children}
    </RadixDropdown.Arrow>
  );
});
DropdownArrow.displayName = RadixDropdown.Arrow.displayName;

const DropdownItem = forwardRef<
  ElementRef<typeof RadixDropdown.Item>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Item>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Item ref={ref} {...props}>
      {children}
    </RadixDropdown.Item>
  );
});
DropdownItem.displayName = RadixDropdown.Item.displayName;

const DropdownGroup = forwardRef<
  ElementRef<typeof RadixDropdown.Group>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Group>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Group ref={ref} {...props}>
      {children}
    </RadixDropdown.Group>
  );
});
DropdownGroup.displayName = RadixDropdown.Group.displayName;

const DropdownLabel = forwardRef<
  ElementRef<typeof RadixDropdown.Label>,
  ComponentPropsWithoutRef<typeof RadixDropdown.Label>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.Label ref={ref} {...props}>
      {children}
    </RadixDropdown.Label>
  );
});
DropdownLabel.displayName = RadixDropdown.Label.displayName;

const DropdownCheckbox = forwardRef<
  ElementRef<typeof RadixDropdown.CheckboxItem>,
  ComponentPropsWithoutRef<typeof RadixDropdown.CheckboxItem>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.CheckboxItem ref={ref} {...props}>
      {children}
    </RadixDropdown.CheckboxItem>
  );
});
DropdownCheckbox.displayName = RadixDropdown.CheckboxItem.displayName;

const DropdownRadioGroup = forwardRef<
  ElementRef<typeof RadixDropdown.RadioGroup>,
  ComponentPropsWithoutRef<typeof RadixDropdown.RadioGroup>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.RadioGroup ref={ref} {...props}>
      {children}
    </RadixDropdown.RadioGroup>
  );
});
DropdownRadioGroup.displayName = RadixDropdown.RadioGroup.displayName;

const DropdownRadioItem = forwardRef<
  ElementRef<typeof RadixDropdown.RadioItem>,
  ComponentPropsWithoutRef<typeof RadixDropdown.RadioItem>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.RadioItem ref={ref} {...props}>
      {children}
    </RadixDropdown.RadioItem>
  );
});
DropdownRadioItem.displayName = RadixDropdown.RadioItem.displayName;

const DropdownItemIndicator = forwardRef<
  ElementRef<typeof RadixDropdown.ItemIndicator>,
  ComponentPropsWithoutRef<typeof RadixDropdown.ItemIndicator>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.ItemIndicator ref={ref} {...props}>
      {children}
    </RadixDropdown.ItemIndicator>
  );
});
DropdownItemIndicator.displayName = RadixDropdown.ItemIndicator.displayName;

const DropdownSubTrigger = forwardRef<
  ElementRef<typeof RadixDropdown.SubTrigger>,
  ComponentPropsWithoutRef<typeof RadixDropdown.SubTrigger>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.SubTrigger ref={ref} {...props}>
      {children}
    </RadixDropdown.SubTrigger>
  );
});
DropdownSubTrigger.displayName = RadixDropdown.SubTrigger.displayName;

const DropdownSubContent = forwardRef<
  ElementRef<typeof RadixDropdown.SubContent>,
  ComponentPropsWithoutRef<typeof RadixDropdown.SubContent>
>(({ children, ...props }, ref) => {
  return (
    <RadixDropdown.SubContent ref={ref} {...props}>
      {children}
    </RadixDropdown.SubContent>
  );
});
DropdownSubContent.displayName = RadixDropdown.SubContent.displayName;

export {
  Dropdown,
  DropdownPortal,
  DropdownSeparator,
  DropdownSub,
  DropdownTrigger,
  DropdownContent,
  DropdownArrow,
  DropdownItem,
  DropdownGroup,
  DropdownLabel,
  DropdownCheckbox,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownItemIndicator,
  DropdownSubTrigger,
  DropdownSubContent,
};
