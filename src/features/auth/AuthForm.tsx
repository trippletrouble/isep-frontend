import type { ReactNode } from "react";
import logoImg from "@/assets/logo.png";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function AuthForm({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4 py-12">
      <img src={logoImg} alt="LUDO 2.0" className="mb-10 w-80 select-none" />
      <div className="w-full max-w-[400px] rounded-[20px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </div>
  );
}
