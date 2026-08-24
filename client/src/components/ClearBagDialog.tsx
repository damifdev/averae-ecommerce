import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ClearBagDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function ClearBagDialog({ open, onOpenChange, onConfirm }: ClearBagDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="clear-bag-dialog" className="border-[#D7C2A7] bg-[#FFFDF8] text-[#382820] sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="font-display text-3xl font-normal">Clear your bag?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-[#866F62]">
            This will remove every selection from your bag. You can continue browsing and add pieces again whenever you are ready.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:justify-start">
          <AlertDialogCancel data-testid="clear-bag-cancel" className="border-[#D7C2A7] bg-transparent text-[#382820] hover:bg-[#F2EDE5] hover:text-[#382820]">Keep selections</AlertDialogCancel>
          <AlertDialogAction data-testid="clear-bag-confirm" onClick={onConfirm} className="action-link-light border border-[#382820] bg-[#382820] text-[#FFFDF8] hover:bg-[#B7654A] hover:text-[#FFFDF8]">Clear bag</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
