import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";

interface StudentNameModalProps {
  open: boolean;
  onConfirm: (studentName: string, rollNo: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = "cravepoint_student_info";

export default function StudentNameModal({
  open,
  onConfirm,
  onCancel,
  isLoading,
}: StudentNameModalProps) {
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [nameError, setNameError] = useState("");

  // Pre-fill from localStorage
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { name, roll } = JSON.parse(saved) as {
            name: string;
            roll: string;
          };
          if (name) setStudentName(name);
          if (roll) setRollNo(roll);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentName.trim();
    if (!trimmedName) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");
    // Save to localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: trimmedName, roll: rollNo.trim() }),
      );
    } catch {
      // ignore
    }
    await onConfirm(trimmedName, rollNo.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isLoading) onCancel();
      }}
    >
      <DialogContent
        data-ocid="order.dialog"
        className="font-outfit max-w-sm"
        style={{
          backgroundColor: "#111111",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#ffffff",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-bold">
            Almost there! 🍽️
          </DialogTitle>
          <p className="text-white/50 text-sm mt-1">
            Tell us who this order is for
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Student Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="student-name"
              className="text-white/70 text-xs font-semibold uppercase tracking-wider"
            >
              Your Name <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                style={{ width: 15, height: 15 }}
              />
              <Input
                id="student-name"
                data-ocid="order.input"
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setNameError("");
                }}
                placeholder="e.g. Rahul Kumar"
                autoComplete="name"
                autoFocus
                className="pl-9 text-white placeholder:text-white/25 focus-visible:ring-sky-500"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: nameError
                    ? "1.5px solid rgba(239,68,68,0.6)"
                    : "1.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>
            {nameError && (
              <p data-ocid="order.error_state" className="text-red-400 text-xs">
                {nameError}
              </p>
            )}
          </div>

          {/* Roll Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="roll-no"
              className="text-white/70 text-xs font-semibold uppercase tracking-wider"
            >
              Roll Number / Student ID{" "}
              <span className="text-white/30 normal-case font-normal">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Hash
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                style={{ width: 15, height: 15 }}
              />
              <Input
                id="roll-no"
                data-ocid="order.search_input"
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 21CS045"
                autoComplete="off"
                className="pl-9 text-white placeholder:text-white/25 focus-visible:ring-sky-500"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>
          </div>

          <DialogFooter className="mt-5 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              data-ocid="order.cancel_button"
              onClick={onCancel}
              disabled={isLoading}
              className="text-white/50 hover:text-white hover:bg-white/10 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="order.confirm_button"
              disabled={isLoading}
              className="flex-1 font-bold"
              style={{
                backgroundColor: "#0B639C",
                color: "#ffffff",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing...
                </>
              ) : (
                "Confirm Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
