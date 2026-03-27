import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface OrderedItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderConfirmationProps {
  orderId: string;
  studentName: string;
  rollNo: string;
  items: OrderedItem[];
  onTrackOrder: () => void;
}

function formatOrderToken(id: string): string {
  return id.length > 8 ? id.slice(0, 8).toUpperCase() : id.toUpperCase();
}

export default function OrderConfirmation({
  orderId,
  studentName,
  rollNo,
  items,
  onTrackOrder,
}: OrderConfirmationProps) {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen font-outfit flex flex-col items-center justify-start px-4 py-8"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="flex items-center justify-center rounded-full mb-5 mt-4"
        style={{
          width: 80,
          height: 80,
          backgroundColor: "rgba(74,222,128,0.12)",
          border: "2px solid rgba(74,222,128,0.3)",
        }}
        data-ocid="order.success_state"
      >
        <CheckCircle2
          className="text-green-400"
          style={{ width: 40, height: 40 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6"
      >
        <h1 className="text-white font-bold text-2xl sm:text-3xl">
          Order Confirmed!
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Your delicious food is on its way
        </p>
      </motion.div>

      {/* Token Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden mb-5"
        style={{
          backgroundColor: "#111111",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Token header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #0B639C 0%, #0a4f7f 100%)",
          }}
        >
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Order Token
            </p>
            <p className="text-white font-bold text-2xl font-mono tracking-widest mt-0.5">
              #{formatOrderToken(orderId)}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <MapPin className="text-white" style={{ width: 20, height: 20 }} />
          </div>
        </div>

        {/* Student info */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="text-white font-semibold text-sm">{studentName}</p>
            {rollNo && (
              <p className="text-white/40 text-xs mt-0.5">ID: {rollNo}</p>
            )}
          </div>
          <span
            className="text-xs font-bold rounded-full px-2.5 py-1"
            style={{
              backgroundColor: "rgba(234,179,8,0.15)",
              color: "#facc15",
              border: "1px solid rgba(234,179,8,0.3)",
            }}
          >
            Ordered
          </span>
        </div>

        {/* Items */}
        <div className="px-5 py-3 space-y-2">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            Order Summary
          </p>
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#0B639C",
                    color: "#ffffff",
                  }}
                >
                  {item.qty}
                </span>
                <span className="text-white/80 text-sm truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-white font-semibold text-sm ml-2">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}

          {/* Total */}
          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-white/60 text-sm font-semibold">Total</span>
            <span className="text-sky-400 font-bold text-lg">
              ₹{totalPrice}
            </span>
          </div>
        </div>

        {/* Track button */}
        <div className="px-5 pb-5 pt-2">
          <button
            type="button"
            data-ocid="order.primary_button"
            onClick={onTrackOrder}
            className="w-full rounded-xl font-bold py-3.5 text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: "#0B639C",
              boxShadow: "0 4px 14px rgba(11,99,156,0.35)",
            }}
          >
            Track My Order
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
