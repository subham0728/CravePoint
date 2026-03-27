import { ArrowLeft, ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface MyOrdersProps {
  onBack: () => void;
}

export interface LocalOrder {
  id: string;
  studentName: string;
  rollNo: string;
  items: Array<[string, number]>;
  timestamp: number;
  status: string;
  total: number;
}

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

function formatOrderId(id: string): string {
  return id.length > 12
    ? `#${id.slice(0, 8).toUpperCase()}…`
    : `#${id.toUpperCase()}`;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readOrdersFromStorage(): LocalOrder[] {
  try {
    const raw = localStorage.getItem("cravepoint_orders");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalOrder[];
  } catch {
    return [];
  }
}

export default function MyOrders({ onBack }: MyOrdersProps) {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    setError("");
    try {
      const saved = readOrdersFromStorage();
      const sorted = [...saved].sort((a, b) => b.timestamp - a.timestamp);
      setOrders(sorted);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div
      className="min-h-screen font-outfit"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      {/* Header */}
      <header
        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40"
        style={{ backgroundColor: "#0B639C" }}
      >
        <button
          type="button"
          data-ocid="orders.back.button"
          onClick={onBack}
          className="flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
          aria-label="Go back"
        >
          <ArrowLeft className="text-white" style={{ width: 18, height: 18 }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base leading-tight">
            My Orders
          </h1>
          <p className="text-white/60 text-xs">Your order history</p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          data-ocid="orders.refresh.button"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-white/80 text-xs transition-all active:scale-95"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <main className="px-3 sm:px-5 py-5 max-w-2xl mx-auto space-y-4">
        {/* Error */}
        {error && (
          <div
            data-ocid="orders.error_state"
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div
            data-ocid="orders.loading_state"
            className="flex items-center justify-center py-16"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="animate-spin text-white/40"
                style={{ width: 28, height: 28 }}
              />
              <p className="text-white/40 text-sm">Loading your orders…</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && orders.length === 0 && !error && (
          <div
            data-ocid="orders.empty_state"
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <ClipboardList
              className="mb-4"
              style={{ width: 40, height: 40, color: "rgba(255,255,255,0.12)" }}
            />
            <p className="text-white/30 text-sm font-medium">No orders yet</p>
            <p className="text-white/20 text-xs mt-1">
              Place your first order from the menu!
            </p>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order, index) => {
              const statusKey = order.status;
              const statusColors =
                STATUS_COLORS[statusKey] ?? STATUS_COLORS.ordered;
              const ocidIndex = Math.min(index + 1, 20);

              return (
                <div
                  key={order.id}
                  data-ocid={`orders.item.${ocidIndex}`}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  {/* Order header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-white font-bold font-mono text-sm">
                      {formatOrderId(order.id)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">
                        {formatTimestamp(order.timestamp)}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          border: `1px solid ${statusColors.border}`,
                        }}
                      >
                        {STATUS_LABELS[statusKey]}
                      </span>
                    </div>
                  </div>

                  {/* Items + total */}
                  <div className="px-4 py-3 space-y-2">
                    {order.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.map(([itemName, qty]) => (
                          <span
                            key={itemName}
                            className="rounded-lg px-2.5 py-1 text-xs text-white/70"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)",
                            }}
                          >
                            {itemName} ×{qty}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/30 text-xs">No items recorded</p>
                    )}
                    {order.total > 0 && (
                      <p className="text-sky-400/80 text-xs font-semibold pt-1">
                        Total: ₹{order.total}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
