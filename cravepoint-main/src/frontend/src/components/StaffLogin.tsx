import { AlertCircle, Lock, Utensils } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

interface StaffLoginProps {
  onLoginSuccess: (password: string) => void;
  onBack: () => void;
}

export default function StaffLogin({
  onLoginSuccess,
  onBack,
}: StaffLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { actor } = useActor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await actor.staffLogin(password);
      if (success) {
        onLoginSuccess(password);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 font-outfit"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="mb-8 text-white/50 hover:text-white/80 text-sm transition-colors self-start max-w-sm w-full mx-auto"
        style={{ maxWidth: "380px" }}
      >
        ← Back to ordering
      </button>

      {/* Card */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: "380px",
          backgroundColor: "#111111",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Card header */}
        <div
          className="flex flex-col items-center pt-8 pb-6 px-8"
          style={{
            background: "linear-gradient(135deg, #0B639C 0%, #0a4f7f 100%)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-white/20 mb-3"
            style={{ width: 56, height: 56 }}
          >
            <Utensils
              className="text-white"
              style={{ width: 26, height: 26 }}
            />
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight">
            CravePoint
          </h1>
          <p className="text-white/70 text-sm mt-1">Staff Access Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pt-7 pb-8 space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="staff-password"
              className="block text-white/70 text-xs font-semibold uppercase tracking-wider"
            >
              Staff Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                style={{ width: 16, height: 16 }}
              />
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter staff password"
                autoComplete="current-password"
                data-ocid="staff.login.input"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: error
                    ? "1.5px solid rgba(239,68,68,0.6)"
                    : "1.5px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.border = "1.5px solid rgba(11,99,156,0.8)";
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.border =
                      "1.5px solid rgba(255,255,255,0.12)";
                  }
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              data-ocid="staff.login.error_state"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <AlertCircle
                className="text-red-400 flex-shrink-0"
                style={{ width: 15, height: 15 }}
              />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !actor}
            data-ocid="staff.login.submit_button"
            className="w-full rounded-xl font-bold py-3 text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: "#0B639C",
              boxShadow: "0 4px 14px rgba(11,99,156,0.35)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                  style={{ width: 14, height: 14 }}
                />
                Verifying...
              </span>
            ) : (
              "Login to Staff Dashboard"
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-white/20 text-xs mt-8 text-center">
        This area is restricted to cafeteria staff only.
      </p>
    </div>
  );
}
