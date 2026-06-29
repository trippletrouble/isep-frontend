import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useUIStore } from "@/stores/ui.store";

export function ErrorToast() {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    toasts.forEach((t) => {
      const options = { description: t.message, id: t.id };
      switch (t.type) {
        case "error":
          toast.error(t.title, options);
          break;
        case "success":
          toast.success(t.title, options);
          break;
        case "warning":
          toast.warning(t.title, options);
          break;
        default:
          toast.info(t.title, options);
      }
      removeToast(t.id);
    });
  }, [toasts, removeToast]);

  return <Toaster position="bottom-right" theme="dark" richColors />;
}
