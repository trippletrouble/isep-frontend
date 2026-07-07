import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";

interface PageSubHeaderProps {
  backTo?: string;
  center?: ReactNode;
  right?: ReactNode;
}

export function PageSubHeader({ backTo, center, right }: PageSubHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const backContent = (
    <>
      <ChevronLeft className="w-4 lg:w-6" strokeWidth={2.5} /> {t("Zurück")}
    </>
  );

  const backClasses =
    "flex items-center gap-1 text-sm lg:text-xl font-bold hover:text-white transition-colors";

  return (
    <div className="w-full flex items-center relative mb-4 lg:mb-8 text-accent font-afacad tracking-[0.02em]">
      <div className="flex-1 flex justify-start z-10">
        {backTo ? (
          <Link to={backTo} className={backClasses}>
            {backContent}
          </Link>
        ) : (
          <button onClick={() => navigate(-1)} className={backClasses}>
            {backContent}
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 flex justify-center z-0 pointer-events-none">
        <span className="pointer-events-auto text-sm lg:text-xl font-bold uppercase">
          {center}
        </span>
      </div>

      <div className="flex-1 flex justify-end z-10">{right}</div>
    </div>
  );
}
