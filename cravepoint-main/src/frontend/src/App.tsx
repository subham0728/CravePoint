import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, ClipboardList, Utensils } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { OrderStatus } from "./backend.d";
import CartBar from "./components/CartBar";
import FoodSection from "./components/FoodSection";
import MyOrders from "./components/MyOrders";
import type { LocalOrder } from "./components/MyOrders";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderTracker from "./components/OrderTracker";
import StaffDashboard from "./components/StaffDashboard";
import StaffLogin from "./components/StaffLogin";
import StudentNameModal from "./components/StudentNameModal";
import { useActor } from "./hooks/useActor";

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_ORDERS_KEY = "cravepoint_orders";
const MAX_STORED_ORDERS = 20;

function readStoredOrders(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(LS_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

function writeStoredOrders(orders: LocalOrder[]): void {
  try {
    localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

function saveOrderToHistory(order: LocalOrder): void {
  const existing = readStoredOrders();
  // Remove any duplicate with the same id, then prepend, then cap at max
  const filtered = existing.filter((o) => o.id !== order.id);
  const updated = [order, ...filtered].slice(0, MAX_STORED_ORDERS);
  writeStoredOrders(updated);
}

function updateOrderStatusInStorage(orderId: string, status: string): void {
  const existing = readStoredOrders();
  const updated = existing.map((o) =>
    o.id === orderId ? { ...o, status } : o,
  );
  writeStoredOrders(updated);
}

type AppView = "student" | "staff-login" | "staff-dashboard" | "my-orders";
type StudentView = "menu" | "confirmation" | "tracker";

// ── Menu data with prices ─────────────────────────────────────────────────────

const snackItems = [
  {
    name: "Veg Maggie",
    image: "/assets/generated/veg-maggie.dim_400x300.jpg",
    price: 40,
  },
  {
    name: "Dosa",
    image: "/assets/generated/dosa.dim_400x300.jpg",
    price: 60,
  },
  {
    name: "Samosa / Litti",
    image: "/assets/generated/samosa-litti.dim_400x300.jpg",
    price: 25,
  },
  {
    name: "Chola Bhatura",
    image: "/assets/generated/chola-bhatura.dim_400x300.jpg",
    price: 70,
  },
];

const chipItems = [
  {
    name: "Lays",
    image: "/assets/generated/lays.dim_400x300.jpg",
    price: 20,
  },
  {
    name: "Kurkure",
    image: "/assets/generated/kurkure.dim_400x300.jpg",
    price: 15,
  },
  {
    name: "Takatak",
    image: "/assets/generated/takatak.dim_400x300.jpg",
    price: 15,
  },
  {
    name: "Nachos",
    image: "/assets/generated/nachos.dim_400x300.jpg",
    price: 30,
  },
];

const ALL_ITEMS = [...snackItems, ...chipItems];
const PRICE_MAP: Record<string, number> = Object.fromEntries(
  ALL_ITEMS.map((item) => [item.name, item.price]),
);

const initialQuantities = (): Record<string, number> => {
  const q: Record<string, number> = {};
  for (const item of ALL_ITEMS) {
    q[item.name] = 0;
  }
  return q;
};

// ── Status → tracker step mapping ────────────────────────────────────────────

function getStatusKey(status: OrderStatus): string {
  if (typeof status === "string") return status;
  const s = status as Record<string, unknown>;
  if ("ordered" in s) return "ordered";
  if ("preparing" in s) return "preparing";
  if ("readyForPickup" in s) return "readyForPickup";
  if ("reviewed" in s) return "reviewed";
  return "ordered";
}

function statusToStep(statusKey: string): number {
  switch (statusKey) {
    case "ordered":
      return 0;
    case "preparing":
      return 1;
    case "readyForPickup":
      return 2;
    case "reviewed":
      return 4;
    default:
      return 0;
  }
}

function statusToMessage(statusKey: string): string {
  switch (statusKey) {
    case "ordered":
      return "Order received! We'll start preparing soon...";
    case "preparing":
      return "Your order is being prepared... 🍳";
    case "readyForPickup":
      return "🎉 Come and collect your delicious food!";
    case "reviewed":
      return "Thanks for ordering at CravePoint! ⭐";
    default:
      return "";
  }
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<AppView>("student");
  const [studentView, setStudentView] = useState<StudentView>("menu");
  const [staffPassword, setStaffPassword] = useState("");
  const [quantities, setQuantities] =
    useState<Record<string, number>>(initialQuantities);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Order state
  const [orderId, setOrderId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("");

  const { actor } = useActor();

  // ── Quantities helpers ──
  const handleIncrement = useCallback((name: string) => {
    setQuantities((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
  }, []);

  const handleDecrement = useCallback((name: string) => {
    setQuantities((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] ?? 0) - 1),
    }));
  }, []);

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [name, qty]) => {
    return sum + (PRICE_MAP[name] ?? 0) * qty;
  }, 0);

  // ── Order polling ──
  const pollOrderStatus = useCallback(async () => {
    if (!actor || !orderId) return;
    try {
      const orders = await actor.getMyOrders();
      const myOrder = orders.find((o) => o.id === orderId);
      if (myOrder) {
        const key = getStatusKey(myOrder.status);
        setActiveStep(statusToStep(key));
        setStatusMessage(statusToMessage(key));
        // Sync status back to localStorage so "My Orders" stays up to date
        updateOrderStatusInStorage(orderId, key);
      }
    } catch {
      // Silently fail polling
    }
  }, [actor, orderId]);

  // Poll every 5 seconds when on tracker view
  useEffect(() => {
    if (studentView !== "tracker" || !orderId) return;
    const interval = setInterval(pollOrderStatus, 5000);
    // Also poll immediately
    pollOrderStatus();
    return () => clearInterval(interval);
  }, [studentView, orderId, pollOrderStatus]);

  // ── Order placement ──
  const handleOpenOrderModal = () => {
    if (totalItems === 0) return;
    setShowNameModal(true);
  };

  const handleConfirmOrder = async (name: string, roll: string) => {
    setIsPlacingOrder(true);
    try {
      const items: Array<[string, bigint]> = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([itemName, qty]) => [itemName, BigInt(qty)]);

      let newOrderId = `order_${Date.now()}`;
      if (actor) {
        try {
          newOrderId = await actor.placeOrder(items);
        } catch {
          // Fall back to local ID for demo
        }
      }

      // Save to localStorage order history
      const orderedItemPairs: Array<[string, number]> = Object.entries(
        quantities,
      )
        .filter(([, qty]) => qty > 0)
        .map(([itemName, qty]) => [itemName, qty]);

      saveOrderToHistory({
        id: newOrderId,
        studentName: name,
        rollNo: roll,
        items: orderedItemPairs,
        timestamp: Date.now(),
        status: "ordered",
        total: totalPrice,
      });

      setOrderId(newOrderId);
      setStudentName(name);
      setRollNo(roll);
      setActiveStep(0);
      setStatusMessage(statusToMessage("ordered"));
      setShowNameModal(false);
      setStudentView("confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // handle error if needed
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── Staff login/logout ──
  const handleStaffLoginSuccess = (password: string) => {
    setStaffPassword(password);
    setView("staff-dashboard");
  };

  const handleStaffLogout = () => {
    setStaffPassword("");
    setView("student");
  };

  // ── Build ordered items for receipt ──
  const orderedItems = ALL_ITEMS.filter(
    (item) => (quantities[item.name] ?? 0) > 0,
  ).map((item) => ({
    name: item.name,
    qty: quantities[item.name] ?? 0,
    price: item.price,
  }));

  // ── Views ──────────────────────────────────────────────────────────────────

  if (view === "staff-login") {
    return (
      <>
        <Toaster />
        <StaffLogin
          onLoginSuccess={handleStaffLoginSuccess}
          onBack={() => setView("student")}
        />
      </>
    );
  }

  if (view === "staff-dashboard") {
    return (
      <>
        <Toaster />
        <StaffDashboard
          staffPassword={staffPassword}
          onLogout={handleStaffLogout}
        />
      </>
    );
  }

  if (view === "my-orders") {
    return (
      <>
        <Toaster />
        <MyOrders onBack={() => setView("student")} />
      </>
    );
  }

  // ── Student view: Order Confirmation ──
  if (studentView === "confirmation") {
    return (
      <>
        <Toaster />
        {/* Header */}
        <header
          className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 sticky top-0 z-40 font-outfit"
          style={{ backgroundColor: "#0B639C" }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-white/20"
            style={{ width: 40, height: 40 }}
          >
            <Utensils
              className="text-white"
              style={{ width: 20, height: 20 }}
            />
          </div>
          <span className="text-white font-bold text-lg">CravePoint</span>
        </header>

        <OrderConfirmation
          orderId={orderId}
          studentName={studentName}
          rollNo={rollNo}
          items={orderedItems}
          onTrackOrder={() => {
            setStudentView("tracker");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    );
  }

  // ── Student view: Tracker ──
  if (studentView === "tracker") {
    return (
      <div
        className="min-h-screen font-outfit"
        style={{ backgroundColor: "#000000", color: "#ffffff" }}
      >
        <Toaster />
        {/* Header */}
        <header
          className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40"
          style={{ backgroundColor: "#0B639C" }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-white/20 flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <Utensils
              className="text-white"
              style={{ width: 20, height: 20 }}
            />
          </div>
          <span className="text-white font-bold text-lg flex-1">
            CravePoint
          </span>
          <button
            type="button"
            data-ocid="tracker.new_order.button"
            onClick={() => {
              setStudentView("menu");
              setQuantities(initialQuantities());
              setOrderId("");
              setActiveStep(-1);
              setStatusMessage("");
            }}
            className="text-white/70 hover:text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            New Order
          </button>
        </header>

        <OrderTracker activeStep={activeStep} statusMessage={statusMessage} />

        {/* Order details summary */}
        <div className="px-4 sm:px-6 py-6 max-w-xl mx-auto space-y-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                Order Token
              </p>
              <p className="text-white font-bold font-mono text-lg mt-0.5">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="px-5 py-4 space-y-2">
              {orderedItems.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-white/70">
                    {item.name}{" "}
                    <span className="text-white/40">×{item.qty}</span>
                  </span>
                  <span className="text-white font-semibold">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between pt-2 mt-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-white/60 text-sm font-semibold">
                  Total
                </span>
                <span className="text-sky-400 font-bold">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* My Orders button */}
          <button
            type="button"
            data-ocid="tracker.my_orders.button"
            onClick={() => setView("my-orders")}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-white/60 text-sm font-semibold transition-colors hover:text-white hover:bg-white/5"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <ClipboardList style={{ width: 16, height: 16 }} />
            View All My Orders
          </button>
        </div>

        {/* Footer */}
        <footer
          className="text-center py-4 px-4 mt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-white/30" style={{ fontSize: "11px" }}>
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-red-400/50">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400/50 hover:text-sky-400 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // ── Student view: Menu (default) ──────────────────────────────────────────

  return (
    <div
      className="min-h-screen font-outfit"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      <Toaster />

      {/* Student Name Modal */}
      <StudentNameModal
        open={showNameModal}
        onConfirm={handleConfirmOrder}
        onCancel={() => setShowNameModal(false)}
        isLoading={isPlacingOrder}
      />

      {/* ── Logo Header ── */}
      <header
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4"
        style={{ backgroundColor: "#0B639C" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full bg-white/20 flex-shrink-0"
            style={{
              width: "clamp(36px, 5vw, 48px)",
              height: "clamp(36px, 5vw, 48px)",
            }}
          >
            <Utensils
              className="text-white"
              style={{
                width: "clamp(18px, 2.5vw, 26px)",
                height: "clamp(18px, 2.5vw, 26px)",
              }}
            />
          </div>
          <span
            className="text-white font-bold tracking-tight leading-none"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)" }}
          >
            CravePoint
          </span>
        </div>

        {/* My Orders button in header */}
        <button
          type="button"
          data-ocid="nav.my_orders.button"
          onClick={() => setView("my-orders")}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold px-3 py-2 rounded-full transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <ClipboardList style={{ width: 14, height: 14 }} />
          <span className="hidden sm:inline">My Orders</span>
        </button>
      </header>

      {/* ── Order Progress Tracker ── */}
      <OrderTracker activeStep={activeStep} statusMessage={statusMessage} />

      {/* ── Cafe Section Header ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4"
        style={{
          backgroundColor: "#000000",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2
          className="text-white font-bold leading-tight"
          style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}
        >
          University Cafe
        </h2>
        <button
          type="button"
          data-ocid="header.skip.button"
          className="font-semibold rounded-full transition-all duration-200 active:scale-95 flex-shrink-0 ml-3"
          style={{
            backgroundColor: "#38bdf8",
            color: "#0a0f14",
            padding: "6px 16px",
            fontSize: "clamp(11px, 2vw, 13px)",
            minHeight: "36px",
          }}
        >
          Skip the line
        </button>
      </div>

      {/* ── Section Heading ── */}
      <div
        className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span
          className="text-white font-semibold"
          style={{ fontSize: "clamp(13px, 2.5vw, 16px)" }}
        >
          Choose Your Own Snacks
        </span>
        <ChevronDown
          className="text-white/70 flex-shrink-0"
          style={{ width: 16, height: 16 }}
        />
      </div>

      {/* ── Select Snacks ── */}
      <FoodSection
        label="Select Snacks"
        items={snackItems}
        quantities={quantities}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        scope="snacks"
      />

      {/* ── Divider ── */}
      <div
        className="mx-4 sm:mx-6 md:mx-8 my-1"
        style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)" }}
      />

      {/* ── Select Chips ── */}
      <FoodSection
        label="Select Chips"
        items={chipItems}
        quantities={quantities}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        scope="chips"
      />

      {/* ── Footer ── */}
      <footer
        className="text-center py-4 px-4 mt-4 mb-24"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-white/40" style={{ fontSize: "11px" }}>
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-red-400/70">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400/70 hover:text-sky-400 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setView("staff-login")}
            data-ocid="staff.access.link"
            className="text-white/20 hover:text-white/50 transition-colors text-xs underline underline-offset-2"
            style={{ fontSize: "10px" }}
          >
            Staff Access
          </button>
        </div>
      </footer>

      {/* ── Cart Bar (fixed bottom) ── */}
      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        orderPlaced={false}
        onPlaceOrder={handleOpenOrderModal}
      />
    </div>
  );
}
