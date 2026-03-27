import {
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface StaffDashboardProps {
  staffPassword: string;
  onLogout: () => void;
}

// Mirror enum values as constants (matches backend.d.ts enum)
const OS = {
  ordered: "ordered" as OrderStatus,
  preparing: "preparing" as OrderStatus,
  readyForPickup: "readyForPickup" as OrderStatus,
  reviewed: "reviewed" as OrderStatus,
} as const;

const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  preparing: "Preparing",
  readyForPickup: "Ready for Pickup",
  reviewed: "Reviewed",
};

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  ordered: {
    bg: "rgba(234,179,8,0.15)",
    text: "#facc15",
    border: "rgba(234,179,8,0.3)",
  },
  preparing: {
    bg: "rgba(249,115,22,0.15)",
    text: "#fb923c",
    border: "rgba(249,115,22,0.3)",
  },
  readyForPickup: {
    bg: "rgba(34,197,94,0.15)",
    text: "#4ade80",
    border: "rgba(34,197,94,0.3)",
  },
  reviewed: {
    bg: "rgba(156,163,175,0.12)",
    text: "#9ca3af",
    border: "rgba(156,163,175,0.2)",
  },
};

const NEXT_STATUS: Record<string, OrderStatus> = {
  ordered: OS.preparing,
  preparing: OS.readyForPickup,
  readyForPickup: OS.reviewed,
};

const NEXT_BUTTON_LABEL: Record<string, string> = {
  ordered: "Start Preparing",
  preparing: "Mark Ready",
  readyForPickup: "Mark Reviewed",
};

function getStatusKey(status: OrderStatus): string {
  // Handle both enum-style strings and Candid variant objects
  if (typeof status === "string") return status;
  const s = status as Record<string, unknown>;
  if ("ordered" in s) return "ordered";
  if ("preparing" in s) return "preparing";
  if ("readyForPickup" in s) return "readyForPickup";
  if ("reviewed" in s) return "reviewed";
  return "ordered";
}

function formatOrderId(id: string): string {
  return id.length > 12
    ? `#${id.slice(0, 8).toUpperCase()}…`
    : `#${id.toUpperCase()}`;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Change Password Section ──────────────────────────────────────────────────

interface ChangePasswordSectionProps {
  staffPassword: string;
  actor: {
    changeStaffPassword: (old: string, next: string) => Promise<void>;
  } | null;
}

function ChangePasswordSection({
  staffPassword,
  actor,
}: ChangePasswordSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (!actor) return;

    setIsChanging(true);
    try {
      await actor.changeStaffPassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({
        type: "error",
        text: "Failed to change password. Is the current password correct?",
      });
    } finally {
      setIsChanging(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 12px 10px 36px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "#111111",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Toggle header */}
      <button
        type="button"
        data-ocid="staff.change_password.toggle"
        onClick={() => {
          setIsOpen((v) => !v);
          setMessage(null);
        }}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <KeyRound
            className="text-white/50"
            style={{ width: 16, height: 16 }}
          />
          <span className="text-white/70 text-sm font-semibold">
            Change Password
          </span>
        </div>
        {isOpen ? (
          <ChevronUp
            className="text-white/40"
            style={{ width: 16, height: 16 }}
          />
        ) : (
          <ChevronDown
            className="text-white/40"
            style={{ width: 16, height: 16 }}
          />
        )}
      </button>

      {/* Collapsible form */}
      {isOpen && (
        <form
          onSubmit={handleChange}
          className="px-4 pb-5 space-y-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-white/30 text-xs pt-3">
            Current staff password is pre-filled from your session for
            convenience.
          </p>

          {/* Current password */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              style={{ width: 14, height: 14 }}
            />
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              defaultValue={staffPassword}
              data-ocid="staff.change_password.input"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {/* New password */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              style={{ width: 14, height: 14 }}
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-ocid="staff.new_password.input"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          {/* Confirm password */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              style={{ width: 14, height: 14 }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-ocid="staff.confirm_password.input"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          {/* Feedback message */}
          {message && (
            <div
              data-ocid={
                message.type === "success"
                  ? "staff.change_password.success_state"
                  : "staff.change_password.error_state"
              }
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{
                backgroundColor:
                  message.type === "success"
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: message.type === "success" ? "#4ade80" : "#f87171",
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            data-ocid="staff.change_password.submit_button"
            disabled={isChanging}
            className="w-full rounded-xl font-bold py-3 text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#0B639C",
              boxShadow: "0 4px 14px rgba(11,99,156,0.25)",
            }}
          >
            {isChanging ? (
              <>
                <span
                  className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                  style={{ width: 14, height: 14 }}
                />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Staff Dashboard ──────────────────────────────────────────────────────

export default function StaffDashboard({
  staffPassword,
  onLogout,
}: StaffDashboardProps) {
  const { actor } = useActor();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!actor) return;
    try {
      setError("");
      const all = await actor.getAllOrders();
      // Sort newest first
      const sorted = [...all].sort((a, b) => {
        return Number(b.timestamp - a.timestamp);
      });
      setOrders(sorted);
    } catch {
      setError("Failed to load orders. Please refresh.");
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, [actor]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    currentStatus: OrderStatus,
  ) => {
    const key = getStatusKey(currentStatus);
    const nextStatus = NEXT_STATUS[key];
    if (!nextStatus || !actor) return;

    setUpdatingIds((prev) => new Set(prev).add(orderId));
    try {
      await actor.staffUpdateOrderStatus(orderId, nextStatus, staffPassword);
      await fetchOrders();
    } catch {
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const activeOrders = orders.filter(
    (o) => getStatusKey(o.status) !== "reviewed",
  );
  const reviewedOrders = orders.filter(
    (o) => getStatusKey(o.status) === "reviewed",
  );

  return (
    <div
      className="min-h-screen font-outfit"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      {/* Header */}
      <header
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40"
        style={{ backgroundColor: "#0B639C" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full bg-white/20 flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <Utensils
              className="text-white"
              style={{ width: 20, height: 20 }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              CravePoint
            </p>
            <p className="text-white/70 text-xs">Staff Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            data-ocid="staff.dashboard.refresh_button"
            className="flex items-center gap-1.5 rounded-full font-semibold text-xs px-3 py-2 transition-all active:scale-95"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#ffffff",
            }}
            title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            data-ocid="staff.logout.button"
            className="flex items-center gap-1.5 rounded-full font-semibold text-xs px-3 py-2 transition-all active:scale-95"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#ffffff",
            }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main
        className="px-3 sm:px-5 py-5 space-y-6 max-w-4xl mx-auto"
        data-ocid="staff.dashboard.panel"
      >
        {/* Error */}
        {error && (
          <div
            data-ocid="staff.dashboard.error_state"
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div
            data-ocid="staff.dashboard.loading_state"
            className="flex items-center justify-center py-16"
          >
            <div className="flex flex-col items-center gap-3">
              <span
                className="inline-block rounded-full border-2 border-white/20 border-t-white/70 animate-spin"
                style={{ width: 32, height: 32 }}
              />
              <span className="text-white/50 text-sm">Loading orders…</span>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Active",
                  count: activeOrders.length,
                  icon: ClipboardList,
                  color: "#facc15",
                },
                {
                  label: "Preparing",
                  count: orders.filter(
                    (o) => getStatusKey(o.status) === "preparing",
                  ).length,
                  icon: ChefHat,
                  color: "#fb923c",
                },
                {
                  label: "Ready",
                  count: orders.filter(
                    (o) => getStatusKey(o.status) === "readyForPickup",
                  ).length,
                  icon: CheckCircle2,
                  color: "#4ade80",
                },
              ].map(({ label, count, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center rounded-xl py-4 gap-1"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Icon style={{ width: 18, height: 18, color }} />
                  <span className="text-white font-bold text-xl">{count}</span>
                  <span className="text-white/50 text-xs">{label}</span>
                </div>
              ))}
            </div>

            {/* Active orders */}
            <section>
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3 px-1">
                Active Orders
                {activeOrders.length > 0 && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: "#0B639C" }}
                  >
                    {activeOrders.length}
                  </span>
                )}
              </h2>

              {activeOrders.length === 0 ? (
                <div
                  data-ocid="staff.order.empty_state"
                  className="flex flex-col items-center justify-center py-12 rounded-xl"
                  style={{
                    backgroundColor: "#0d0d0d",
                    border: "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <ClipboardList
                    className="mb-3"
                    style={{
                      width: 32,
                      height: 32,
                      color: "rgba(255,255,255,0.15)",
                    }}
                  />
                  <p className="text-white/30 text-sm">
                    No active orders right now
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index + 1}
                      isUpdating={updatingIds.has(order.id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Reviewed orders (collapsed list) */}
            {reviewedOrders.length > 0 && (
              <section>
                <h2 className="text-white/40 font-bold text-xs uppercase tracking-wider mb-3 px-1">
                  Completed Today ({reviewedOrders.length})
                </h2>
                <div className="space-y-2">
                  {reviewedOrders.slice(0, 5).map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={activeOrders.length + index + 1}
                      isUpdating={false}
                      onUpdateStatus={handleUpdateStatus}
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Change Password Section */}
            <section>
              <ChangePasswordSection
                staffPassword={staffPassword}
                actor={actor}
              />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-4 px-4 mt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-white/20" style={{ fontSize: "11px" }}>
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-red-400/40">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400/40 hover:text-sky-400/70 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  index: number;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  compact?: boolean;
}

function OrderCard({
  order,
  index,
  isUpdating,
  onUpdateStatus,
  compact,
}: OrderCardProps) {
  const statusKey = getStatusKey(order.status);
  const statusColors = STATUS_COLORS[statusKey] ?? STATUS_COLORS.ordered;
  const nextButton = NEXT_BUTTON_LABEL[statusKey];
  // Cap numeric suffix at 20 for deterministic markers
  const ocidIndex = Math.min(index, 20);

  return (
    <div
      data-ocid={`staff.order.item.${ocidIndex}`}
      className="rounded-xl overflow-hidden transition-all"
      style={{
        backgroundColor: compact ? "#0a0a0a" : "#111111",
        border: `1px solid ${compact ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)"}`,
        opacity: compact ? 0.6 : 1,
      }}
    >
      <div
        className={`flex items-start justify-between gap-3 ${compact ? "px-3 py-2.5" : "px-4 py-4"}`}
      >
        {/* Left: Order info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-white font-bold font-mono ${compact ? "text-xs" : "text-sm"}`}
            >
              {formatOrderId(order.id)}
            </span>
            {/* Status badge */}
            <span
              className="rounded-full px-2 py-0.5 font-semibold"
              style={{
                fontSize: "10px",
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                border: `1px solid ${statusColors.border}`,
              }}
            >
              {STATUS_LABELS[statusKey]}
            </span>
            {!compact && (
              <span className="text-white/30 text-xs">
                {formatTimestamp(order.timestamp)}
              </span>
            )}
          </div>

          {!compact && order.items.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {order.items.map(([itemName, qty]) => (
                <span
                  key={itemName}
                  className="rounded-lg px-2 py-1 text-xs text-white/70"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  {itemName} ×{qty.toString()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Action button */}
        {nextButton ? (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, order.status)}
            disabled={isUpdating}
            data-ocid={`staff.order.primary_button.${ocidIndex}`}
            className={`flex-shrink-0 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${compact ? "text-xs px-3 py-1.5" : "text-xs sm:text-sm px-3 sm:px-4 py-2"}`}
            style={{
              backgroundColor: "#0B639C",
              color: "#ffffff",
              minWidth: compact ? 80 : 100,
            }}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                  style={{ width: 12, height: 12 }}
                />
              </span>
            ) : (
              nextButton
            )}
          </button>
        ) : (
          <span
            className="flex-shrink-0 text-xs font-semibold rounded-xl px-3 py-2"
            style={{
              backgroundColor: "rgba(156,163,175,0.1)",
              color: "#9ca3af",
            }}
          >
            Done
          </span>
        )}
      </div>
    </div>
  );
}
