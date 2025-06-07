import LOGO from "@/assets/logo.svg";

export const Logo = ({ width = 40, height = 40, ...props }) => {
  return (
    // biome-ignore lint/a11y/useAltText: <explanation>
    <img src={LOGO} alt="logo" className={"w-[40px] h-[40px] "} {...props} />
  );
};
