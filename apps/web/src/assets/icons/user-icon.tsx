import type { SVGProps } from "react";

export function SolarUserRoundedBoldDuotone(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}<circle cx="12" cy="6" r="4" fill={color} /><ellipse cx="12" cy="17" fill={color} opacity=".5" rx="7" ry="4" /></svg>
  )
}