"use client";

import { SignInModalContent } from "@/components/sign-in-modal";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { useMounted } from "@/hooks/use-mounted";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "next-intl";

export const ModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mounted = useMounted();
  const signInModal = useSigninModal();
  const locale = useLocale();

  return (
    <>
      {children}
      {mounted && (
        <Dialog open={signInModal.isOpen} onOpenChange={(open) => {
          if (open) {
            signInModal.onOpen();
          } else {
            signInModal.onClose();
          }
        }}>
          <DialogContent className="p-0 gap-0 max-w-md">
            {/* Hidden title for accessibility */}
            <DialogTitle className="sr-only">
              Sign In
            </DialogTitle>
            <SignInModalContent lang={locale} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
