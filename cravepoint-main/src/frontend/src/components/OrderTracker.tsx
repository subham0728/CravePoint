import { ClipboardList, Flame, Package, Star, Truck } from "lucide-react";

interface OrderTrackerProps {
  activeStep: number;
  statusMessage?: string;
}

const steps = [
  { label: "Ordered", icon: ClipboardList },
  { label: "Preparing", icon: Flame },
  { label: "Ready", icon: Package },
  { label: "Collect", icon: Truck },
  { label: "Review Us", icon: Star },
];

export default function OrderTracker({
  activeStep,
  statusMessage,
}: OrderTrackerProps) {
  return (
    <div
      style={{ backgroundColor: "#0B639C" }}
      className="w-full py-4 px-2 sm:px-4"
    >
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex items-start min-w-max mx-auto px-4 sm:px-8 justify-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= activeStep;
            const isCurrentActive = index === activeStep;

            return (
              <div key={step.label} className="flex items-start">
                {/* Step circle + label */}
                <div
                  className="flex flex-col items-center gap-1.5 sm:gap-2"
                  data-ocid={`tracker.step.${index + 1}`}
                >
                  <div
                    className={`flex items-center justify-center rounded-full transition-all duration-300 shadow-md${isCurrentActive ? " animate-glow-pulse" : ""}`}
                    style={{
                      width: "clamp(44px, 6vw, 64px)",
                      height: "clamp(44px, 6vw, 64px)",
                      backgroundColor: isActive ? "#7986cb" : "#ffffff",
                      border: isActive
                        ? "2.5px solid #ffffff"
                        : "2.5px solid rgba(255,255,255,0.5)",
                      transform: isCurrentActive ? "scale(1.15)" : "scale(1)",
                      boxShadow: isCurrentActive
                        ? "0 0 12px 4px rgba(121,134,203,0.9), 0 0 28px 8px rgba(121,134,203,0.5)"
                        : undefined,
                    }}
                  >
                    <Icon
                      style={{
                        width: "clamp(18px, 2.5vw, 26px)",
                        height: "clamp(18px, 2.5vw, 26px)",
                        color: isActive ? "#ffffff" : "#0B639C",
                      }}
                    />
                  </div>
                  <span
                    className="text-white font-medium text-center leading-tight"
                    style={{
                      fontSize: "clamp(9px, 1.5vw, 11px)",
                      maxWidth: "clamp(48px, 7vw, 70px)",
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className="flex-shrink-0 self-center"
                    style={{
                      width: "clamp(32px, 5vw, 60px)",
                      height: "3px",
                      marginTop: "-12px",
                      background:
                        index < activeStep
                          ? "#7986cb"
                          : "rgba(255,255,255,0.3)",
                      transition: "background 0.3s ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live status message */}
      {statusMessage && (
        <div className="text-center mt-3 pb-1">
          <p
            className="text-white/80 text-xs font-medium"
            style={{ fontSize: "clamp(10px, 2vw, 12px)" }}
          >
            {statusMessage}
          </p>
        </div>
      )}
    </div>
  );
}
