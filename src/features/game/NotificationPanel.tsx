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
        return <span className="text-2xl drop-shadow-md">⚔️</span>;
      case "WIN":
        return <span className="text-2xl drop-shadow-md">🏆</span>;
      case "INFO":
        return <span className="text-2xl drop-shadow-md">💡</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full flex flex-col overflow-hidden origin-top transition-all ${
        data
          ? "max-h-[1000px] opacity-100 translate-y-0 duration-[800ms] ease-[cubic-bezier(0.4,1.8,0.5,1)]"
          : "max-h-0 opacity-0 -translate-y-24 duration-[400ms] ease-out"
      }`}
    >
      <div className="w-full h-full flex flex-col">
        <div className="bg-primary border border-accent hover:border-white rounded-4xl p-6 w-full h-full flex flex-col relative drop-shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
            aria-label="Schließen"
          >
            <X />
          </button>

          <div className="flex flex-col justify-center items-center gap-4 h-full">
            <h3 className="text-2xl text-white font-lilita tracking-[0.02em] uppercase pr-4">
              {data?.title || "\u00A0"}
            </h3>

            <div>
              <p className="text-lg text-center text-white font-afacad leading-tight opacity-90 px-4">
                {data?.message}
              </p>
            </div>

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
    </div>
  );
};
