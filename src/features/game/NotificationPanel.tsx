import { X, BookOpen, Swords, Trophy, Lightbulb, Icon } from "lucide-react";
import { bee } from "@lucide/lab";

export type NotificationData = {
  title: string;
  message: string;
  iconType?: "CAPTURE" | "WIN" | "INFO" | "QUIZ" | "PLAGUE_FLY";
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
        return (
          <Swords
            className="w-5 h-5 lg:w-6 lg:h-6 text-red drop-shadow-md"
            strokeWidth={2.5}
          />
        );
      case "WIN":
        return (
          <Trophy
            className="w-5 h-5 lg:w-6 lg:h-6 text-yellow drop-shadow-md"
            strokeWidth={2.5}
          />
        );
      case "INFO":
        return (
          <Lightbulb
            className="w-5 h-5 lg:w-6 lg:h-6 text-accent drop-shadow-md"
            strokeWidth={2.5}
          />
        );
      case "QUIZ":
        return (
          <BookOpen
            className="w-5 h-5 lg:w-6 lg:h-6 text-blue drop-shadow-md"
            strokeWidth={2.5}
          />
        );
      case "PLAGUE_FLY":
        return (
          <Icon
            iconNode={bee}
            className="w-5 h-5 lg:w-6 lg:h-6 text-yellow drop-shadow-md"
          />
        );
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
      <div className="bg-primary border border-accent hover:border-white rounded-xl lg:rounded-2xl px-4 py-3 min-h-[4rem] w-full relative drop-shadow-lg">
        <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-x-3 lg:gap-x-4 items-center h-full">
          {data?.iconType ? (
            <div className="col-start-1 row-span-2 w-10 h-10 lg:w-12 lg:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
              {renderIcon(data.iconType)}
            </div>
          ) : (
            <div className="col-start-1 row-span-2 w-0" />
          )}

          <div className="col-start-2 row-start-1 flex items-center gap-2 self-end pt-0.5">
            <p className="text-xs lg:text-sm font-lilita uppercase tracking-wide text-accent whitespace-nowrap leading-none">
              {data?.title || "\u00A0"}
            </p>
            {data?.extraText && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white font-bold font-afacad tracking-wide uppercase leading-none">
                {data.extraText}
              </span>
            )}
          </div>

          <div className="col-start-2 row-start-2 self-start pb-0.5 mt-1">
            <p className="text-sm lg:text-base text-white font-afacad leading-tight line-clamp-2">
              {data?.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="col-start-3 row-span-2 text-white/40 hover:text-white transition-colors shrink-0 p-1.5 rounded-lg hover:bg-white/10"
            aria-label="Schließen"
          >
            <X size={18} className="lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
