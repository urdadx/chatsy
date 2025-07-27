import type { LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

// custom icons
export { default as Photo } from "./photo";
export { default as Success } from "./success";
export { default as Tick } from "./tick";

// loaders
export * from "./loading-circle";
export * from "./loading-dots";
export * from "./loading-spinner";

// continent icons
export * from "./continents";

export type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
