import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";
import { X } from "lucide-react";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      closeButton
      icons={{
        close: <X size={18} className="text-red drop-shadow-sm" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-primary border border-accent text-white w-full max-w-md font-afacad rounded-2xl p-4 pr-16 shadow-[0px_16px_22.2px_rgba(0,0,0,0.35)] flex items-center gap-3 relative",
          title: "text-white font-bold text-sm",
          description: "text-white/70 text-xs",
          closeButton:
            "absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full p-1.5 cursor-pointer flex items-center justify-center transition-all",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
