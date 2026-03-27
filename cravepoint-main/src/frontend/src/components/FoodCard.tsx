import { Minus, Plus } from "lucide-react";

interface FoodCardProps {
  name: string;
  image: string;
  price: number;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  itemIndex: number;
  scope: string;
}

export default function FoodCard({
  name,
  image,
  price,
  quantity,
  onIncrement,
  onDecrement,
  itemIndex,
  scope,
}: FoodCardProps) {
  return (
    <div
      data-ocid={`${scope}.item.${itemIndex}`}
      className="relative rounded-xl overflow-hidden group cursor-default"
      style={{
        backgroundColor: "#1e1e1e",
        aspectRatio: "4/3",
        minHeight: "160px",
      }}
    >
      {/* Background image */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Item name + price at top */}
      <div className="absolute top-0 left-0 right-0 p-2.5 sm:p-3">
        <p
          className="text-white font-semibold leading-tight drop-shadow-md"
          style={{ fontSize: "clamp(11px, 2.5vw, 14px)" }}
        >
          {name}
        </p>
        <p
          className="font-bold mt-0.5 drop-shadow-md"
          style={{ fontSize: "clamp(10px, 2vw, 13px)", color: "#38bdf8" }}
        >
          ₹{price}
        </p>
      </div>

      {/* Quantity selector at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 flex items-center justify-center">
        <div
          className="flex items-center rounded-full overflow-hidden shadow-lg"
          style={{
            backgroundColor: "rgba(30, 30, 30, 0.92)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <button
            type="button"
            data-ocid={`${scope}.minus.button.${itemIndex}`}
            onClick={onDecrement}
            disabled={quantity === 0}
            className="flex items-center justify-center text-white transition-colors duration-150 active:bg-white/20 disabled:opacity-40"
            aria-label={`Decrease ${name} quantity`}
            style={{
              width: "clamp(32px, 5vw, 38px)",
              height: "clamp(32px, 5vw, 38px)",
              minWidth: "44px",
              minHeight: "44px",
            }}
          >
            <Minus style={{ width: 14, height: 14 }} />
          </button>

          <span
            data-ocid={`${scope}.quantity.input.${itemIndex}`}
            className="text-white font-bold select-none"
            style={{
              minWidth: "clamp(20px, 3vw, 28px)",
              textAlign: "center",
              fontSize: "clamp(13px, 2.5vw, 16px)",
            }}
          >
            {quantity}
          </span>

          <button
            type="button"
            data-ocid={`${scope}.plus.button.${itemIndex}`}
            onClick={onIncrement}
            className="flex items-center justify-center text-white transition-colors duration-150 active:bg-white/20"
            aria-label={`Increase ${name} quantity`}
            style={{
              width: "clamp(32px, 5vw, 38px)",
              height: "clamp(32px, 5vw, 38px)",
              minWidth: "44px",
              minHeight: "44px",
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
