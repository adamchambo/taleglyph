import type { ButtonHTMLAttributes } from "react";
export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type={type}
      className={`button ${variant === "secondary" ? "secondary" : ""} ${className}`}
      {...props}
    />
  );
}
