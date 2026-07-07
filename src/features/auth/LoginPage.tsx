import { AuthForm } from "./AuthForm";
import { Button } from "@/components/ui/button";
import { getOAuthUrl } from "@/api/auth.api";
import vector7 from "@/assets/vector7.png";
import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const handleGuestMode = () => {
    localStorage.setItem("guest_mode", "true");
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "mock-user-id", username: "Local Tester", role: "USER" },
      isLoading: false,
    });
  };

  return (
    <AuthForm>
      <div className="flex items-center gap-3 mb-8">
        <img src={vector7} alt="" className="w-6 h-6 object-contain" />
        <h2 className="font-lilita text-white text-2xl tracking-wide m-0">
          ANMELDEN
        </h2>
      </div>
      <p className="text-accent text-sm mb-6 text-center">
        Du wirst zu unserem Anmelde-Portal weitergeleitet.
      </p>
      <Button
        onClick={() => {
          window.location.href = getOAuthUrl();
        }}
        className="w-full mt-2 font-lilita text-xl tracking-widest bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Mit Keycloak anmelden
      </Button>

      <Button
        onClick={handleGuestMode}
        className="w-full mt-4 font-lilita text-xl tracking-widest bg-yellow text-primary hover:bg-[#ebd536] h-14 rounded-[20px] uppercase"
      >
        Gast-Modus (Ohne Login)
      </Button>
    </AuthForm>
  );
}
