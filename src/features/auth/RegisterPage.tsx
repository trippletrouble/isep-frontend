import { AuthForm } from "./AuthForm";
import { Button } from "@/components/ui/button";
import { getOAuthUrl } from "@/api/auth.api";
import vector7 from "@/assets/vector7.png";

export function RegisterPage() {
  return (
    <AuthForm>
      <div className="flex items-center gap-3 mb-8">
        <img src={vector7} alt="" className="w-6 h-6 object-contain" />
        <h2 className="font-lilita text-white text-2xl tracking-wide m-0">
          REGISTRIEREN
        </h2>
      </div>
      <p className="text-accent text-sm mb-6 text-center">
        Registrierung und Anmeldung erfolgen über unser Keycloak-Portal.
      </p>
      <Button
        onClick={() => {
          window.location.href = getOAuthUrl();
        }}
        className="w-full mt-2 font-lilita text-xl tracking-widest bg-primary text-green hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Mit Keycloak registrieren
      </Button>
    </AuthForm>
  );
}
