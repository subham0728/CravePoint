import { CheckCircle2, ShoppingCart } from "lucide-react";

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  orderPlaced: boolean;
  onPlaceOrder: () => void;
}

export default function CartBar({
  totalItems,
  totalPrice,
  orderPlaced,
  onPlaceOrder,
}: CartBarProps) {
  if (orderPlaced) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-4 shadow-2xl"
        style={{ backgroundColor: "#1a2e1a", borderTop: "2px solid #4ade80" }}
        data-ocid="cart.total.panel"
      >
        <CheckCircle2
          className="text-green-400 flex-shrink-0"
          style={{ width: 22, height: 22 }}
        />
        <span className="text-green-300 font-semibold text-base">
          Order placed! Check your progress above.
        </span>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-3 py-3 shadow-2xl"
      style={{
        backgroundColor: "#111111",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
      data-ocid="cart.total.panel"
    >
      <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
        {/* Cart info */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex items-center justify-center rounded-full bg-white/10 flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <ShoppingCart
              className="text-white"
              style={{ width: 18, height: 18 }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {totalItems === 0
                ? "No items selected"
                : `${totalItems} item${totalItems > 1 ? "s" : ""} in cart`}
            </p>
            {totalItems > 0 && (
              <p className="text-white/50 text-xs font-medium">
                Total:{" "}
                <span className="text-sky-400 font-bold">₹{totalPrice}</span>
              </p>
            )}
          </div>
        </div>

        {/* Place order button */}
        <button
          type="button"
          data-ocid="cart.place_order.button"
          onClick={onPlaceOrder}
          disabled={totalItems === 0}
          className="flex-shrink-0 rounded-full font-bold text-sm px-5 py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          style={{
            backgroundColor:
              totalItems > 0 ? "#0B639C" : "rgba(255,255,255,0.1)",
            color: "#ffffff",
            minHeight: "44px",
            minWidth: "120px",
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
