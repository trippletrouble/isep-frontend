import { Lock, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getLevelRules } from "./levelRules";
import { useTranslation } from "@/i18n";

interface RulesDialogProps {
  levelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RulesDialog({ levelId, open, onOpenChange }: RulesDialogProps) {
  const { t } = useTranslation();
  const levelRules = getLevelRules(t);
  const config = levelRules[levelId] ?? levelRules[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#282828] border border-white/10 text-white rounded-[40px] p-0 overflow-hidden w-[560px] sm:max-w-[560px] shadow-[0px_24px_48px_rgba(0,0,0,0.6)]"
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <X size={16} strokeWidth={3} className="text-white" />
        </button>

        {/* Top section */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 gap-3">
          <h2 className="font-lilita text-white text-4xl uppercase tracking-wide text-center leading-none">
            {t("Spielregeln")}
          </h2>

          {/* Level pill */}
          <span className="bg-[#6C63FF] text-white font-lilita text-sm uppercase tracking-widest px-5 py-1.5 rounded-full">
            {config.levelName}
          </span>
        </div>

        {/* Content card */}
        <div className="mx-4 mb-6 bg-[#1e1e1e] rounded-[24px] p-5 max-h-[55vh] overflow-y-auto">
          {config.comingSoon ? (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5">
                <Lock size={28} className="text-accent" />
              </div>
              <div className="text-center">
                <p className="font-lilita text-white text-2xl uppercase tracking-wide">
                  {t("Demnächst")}
                </p>
                <p className="text-accent text-sm font-afacad mt-1 max-w-[220px] mx-auto leading-relaxed">
                  {t("Diese Erweiterung wird in einer zukünftigen Version freigeschaltet.")}
                </p>
              </div>

              {/* Teaser */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1">
                <p className="text-accent text-xs font-afacad uppercase tracking-widest mb-3">
                  {t("Vorschau")}
                </p>
                {config.rules.map((rule, i) => (
                  <div key={i}>
                    <p className="text-white font-bold font-afacad text-sm">
                      {rule.title}
                    </p>
                    <p className="text-accent font-afacad text-sm mt-0.5 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {config.rules.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#6C63FF] text-white font-lilita text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-white font-bold font-afacad text-base leading-snug">
                      {rule.title}
                    </p>
                    <p className="text-accent font-afacad text-sm mt-0.5 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
