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

export const NotificationPanel = ({ data, onClose }: NotificationPanelProps) => {
  const renderIcon = (type?: string) => {
    switch (type) {
      case "CAPTURE": return <span className="text-lg lg:text-2xl drop-shadow-md">⚔️</span>;
      case "WIN":     return <span className="text-lg lg:text-2xl drop-shadow-md">🏆</span>;
      case "INFO":    return <span className="text-lg lg:text-2xl drop-shadow-md">💡</span>;
      default:        return null;
    }
  };

  return (
    <div
      className={`w-full overflow-hidden origin-top transition-all ${
        data
          ? "max-h-[1000px] opacity-100 translate-y-0 duration-[800ms] ease-[cubic-bezier(0.4,1.8,0.5,1)]"
          : "max-h-0 opacity-0 -translate-y-24 duration-[400ms] ease-out"
      }`}
    >
      <div className="bg-primary border border-accent hover:border-white rounded-2xl lg:rounded-4xl p-3 lg:p-6 w-full relative drop-shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 lg:top-5 lg:right-5 text-white/50 hover:text-white transition-colors"
          aria-label="Schließen"
        >
          <X size={16} className="lg:w-5 lg:h-5" />
        </button>

        {/* Mobile: horizontal layout */}
        <div className="flex lg:hidden items-center gap-3 pr-6">
          {data?.iconType && renderIcon(data.iconType)}
          <div className="min-w-0">
            <p className="text-xs font-lilita uppercase tracking-wide text-white/70">
              {data?.title || "\u00A0"}
            </p>
            <p className="text-sm text-white font-afacad leading-tight truncate">
              {data?.message}
            </p>
          </div>
        </div>

        {/* Desktop: vertical layout (original) */}
        <div className="hidden lg:flex flex-col items-center gap-4">
          <h3 className="text-2xl text-white font-lilita tracking-[0.02em] uppercase pr-4">
            {data?.title || "\u00A0"}
          </h3>
          <p className="text-lg text-center text-white font-afacad leading-tight opacity-90 px-4">
            {data?.message}
          </p>
          {(data?.iconType || data?.extraText) && (
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl w-max">
              {renderIcon(data?.iconType)}
              {data?.extraText && (
                <span className="text-white font-bold font-afacad tracking-wide uppercase">
                  {data.extraText}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};