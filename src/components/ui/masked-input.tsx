import { forwardRef, type InputHTMLAttributes } from "react";
import { applyMask, type MaskType } from "@/lib/masks";
import { Input } from "@/components/ui/input";

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: MaskType;
  onChange: (value: string) => void;
  value?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value = "", className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(applyMask(mask, e.target.value));
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        className={className}
        inputMode={mask === "plate" || mask === "chassis" ? "text" : "numeric"}
        {...props}
      />
    );
  },
);
MaskedInput.displayName = "MaskedInput";
