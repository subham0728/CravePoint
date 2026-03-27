import FoodCard from "./FoodCard";

interface FoodItem {
  name: string;
  image: string;
  price: number;
}

interface FoodSectionProps {
  label: string;
  items: FoodItem[];
  quantities: Record<string, number>;
  onIncrement: (name: string) => void;
  onDecrement: (name: string) => void;
  scope: string;
}

export default function FoodSection({
  label,
  items,
  quantities,
  onIncrement,
  onDecrement,
  scope,
}: FoodSectionProps) {
  return (
    <div className="px-3 sm:px-5 md:px-6 py-3">
      <p
        className="text-white font-bold mb-3 sm:mb-4"
        style={{ fontSize: "clamp(13px, 2.5vw, 16px)" }}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {items.map((item, index) => (
          <FoodCard
            key={item.name}
            name={item.name}
            image={item.image}
            price={item.price}
            quantity={quantities[item.name] ?? 0}
            onIncrement={() => onIncrement(item.name)}
            onDecrement={() => onDecrement(item.name)}
            itemIndex={index + 1}
            scope={scope}
          />
        ))}
      </div>
    </div>
  );
}
