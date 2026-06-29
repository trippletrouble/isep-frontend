import { X } from "lucide-react";

export type NotificationData = {
  title: string;
  message: string;
  iconType?: "CAPTURE" | "WIN" | "INFO";
  extraText?: string;
};

interface NotificationPanelProps {
  data: NotificationData | null;
  onClose: () => void;
}

export const NotificationPanel = ({
  data,
  onClose,
}: NotificationPanelProps) => {
  const renderIcon = (type?: string) => {
    switch (type) {
      case "CAPTURE":
        return <span className="text-lg lg:text-xl drop-shadow-md">⚔️</span>;
      case "WIN":
        return <span className="text-lg lg:text-xl drop-shadow-md">🏆</span>;
      case "INFO":
        return <span className="text-lg lg:text-xl drop-shadow-md">💡</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full overflow-hidden origin-top transition-all ${
        data
          ? "max-h-[200px] opacity-100 translate-y-0 duration-[600ms] ease-[cubic-bezier(0.4,1.5,0.5,1)]"
          : "max-h-0 opacity-0 -translate-y-4 duration-[300ms] ease-out"
      }`}
    >
      <div className="bg-primary border border-accent hover:border-white rounded-xl lg:rounded-2xl px-4 h-14 w-full relative drop-shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {data?.iconType && (
            <div className="shrink-0 flex items-center justify-center">
              {renderIcon(data.iconType)}
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-3 min-w-0">
            <p className="text-xs lg:text-sm font-lilita uppercase tracking-wide text-accent whitespace-nowrap">
              {data?.title || "\u00A0"}
            </p>
            <p className="text-sm lg:text-base text-white font-afacad leading-tight truncate">
              {data?.message}
            </p>
            {data?.extraText && (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white font-bold font-afacad tracking-wide uppercase hidden lg:inline-block">
                {data.extraText}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors shrink-0 p-1"
          aria-label="Schließen"
        >
          <X size={16} className="lg:w-5 lg:h-5" />
        </button>
      </div>
    </div>
  );
};
