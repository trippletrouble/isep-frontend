import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-all outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-[state=checked]:bg-green data-[state=unchecked]:bg-[#DB5757] data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-primary shadow-lg ring-0 transition-transform duration-200",
          "group-data-[size=default]/switch:h-5 group-data-[size=default]/switch:w-5 group-data-[size=sm]/switch:h-4 group-data-[size=sm]/switch:w-4",
          "group-data-[state=checked]/switch:translate-x-5 group-data-[state=unchecked]/switch:translate-x-0",
          "group-data-[size=sm]/switch:group-data-[state=checked]/switch:translate-x-4",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
