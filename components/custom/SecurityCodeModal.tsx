// components/SecurityCodeModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

type SecurityCodeModalProps = {
  isOpen: boolean;
  contestId: string;
  onClose: () => void;
};

export function SecurityCodeModal({
  isOpen,
  contestId,
  onClose,
}: SecurityCodeModalProps) {
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Private Contest
          </DialogTitle>
          <DialogDescription>
            This is a private contest. Please enter the security code to access
            it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Enter security code"
              className="w-full"
              autoComplete="off"
              disabled={isSubmitting}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !securityCode.trim()}
            >
              {isSubmitting ? "Verifying..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
