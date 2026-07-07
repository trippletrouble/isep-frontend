import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "./AuthForm";
import { Button } from "@/components/ui/button";
import { getOAuthUrl, testLogin } from "@/api/auth.api";
import vector7 from "@/assets/vector7.png";
import { useAuthStore } from "@/stores/auth.store";
import { T, useTranslation } from "@/i18n";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGuestMode = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `Spieler_${randomNum}`;
    const sub = `sub_${randomNum}_${Date.now()}`;
    try {
      const user = await testLogin(username, sub);
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.error("Guest mode login failed", err);
    }
  };

  return (
    <AuthForm>
      <div className="flex items-center gap-3 mb-8">
        <img src={vector7} alt="" className="w-6 h-6 object-contain" />
        <h2 className="font-lilita text-white text-2xl tracking-wide m-0">
          <T k="ANMELDEN" />
        </h2>
      </div>
      <p className="text-accent text-sm mb-6 text-center">
        <T k="Du wirst zu unserem Anmelde-Portal weitergeleitet." />
      </p>
      <Button
        onClick={() => { window.location.href = getOAuthUrl(); }}
        className="w-full mt-2 font-lilita text-xl tracking-widest bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        {t("Mit Keycloak anmelden")}
      </Button>

      <Button
        onClick={handleGuestMode}
        className="w-full mt-4 font-lilita text-xl tracking-widest bg-yellow text-primary hover:bg-[#ebd536] h-14 rounded-[20px] uppercase"
      >
        {t("Gast-Modus (Ohne Login)")}
      </Button>
    </AuthForm>
  );
}
