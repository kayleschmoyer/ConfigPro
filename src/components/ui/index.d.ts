declare module '@/components/ui/button' {
  export { Button } from './button';
}

declare module '@/components/ui/card' {
  export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from './card';
}

declare module '@/components/ui/input' {
  export { Input } from './input';
}

declare module '@/components/ui/label' {
  export { Label, type LabelProps } from './label';
}

declare module '@/components/ui/checkbox' {
  export { Checkbox, type CheckboxProps } from './checkbox';
}

declare module '@/components/ui/select' {
  export type {
    SelectProps,
    SelectTriggerProps,
    SelectValueProps,
    SelectContentProps,
    SelectItemProps
  } from './select';
  export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
  } from './select';
}

declare module '@/components/ui/dialog' {
  export type { DialogProps } from './dialog';
  export {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
  } from './dialog';
}

declare module '@/components/ui/sheet' {
  export type { SheetProps, SheetTriggerProps, SheetContentProps } from './sheet';
  export {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle
  } from './sheet';
}
