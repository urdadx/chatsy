import { createContext, useContext, useState } from "react";

interface RetrainingBannerContextType {
  show: boolean;
  message: string;
  setBanner: (show: boolean, message?: string) => void;
}

const RetrainingBannerContext = createContext<
  RetrainingBannerContextType | undefined
>(undefined);

export function useRetrainingBanner() {
  const ctx = useContext(RetrainingBannerContext);
  if (!ctx)
    throw new Error(
      "useRetrainingBanner must be used within RetrainingBannerProvider",
    );
  return ctx;
}

export function RetrainingBannerProvider({
  children,
}: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("Retraining is required.");

  const setBanner = (show: boolean, message?: string) => {
    setShow(show);
    if (message) setMessage(message);
  };

  return (
    <RetrainingBannerContext.Provider value={{ show, message, setBanner }}>
      {children}
    </RetrainingBannerContext.Provider>
  );
}
