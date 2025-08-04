import { type ReactNode, createContext, useContext } from "react";

interface EmbedTokenContextType {
  embedToken?: string;
}

const EmbedTokenContext = createContext<EmbedTokenContextType | undefined>(
  undefined,
);

export function EmbedTokenProvider({
  children,
  embedToken,
}: {
  children: ReactNode;
  embedToken?: string;
}) {
  return (
    <EmbedTokenContext.Provider value={{ embedToken }}>
      {children}
    </EmbedTokenContext.Provider>
  );
}

export function useEmbedToken() {
  const context = useContext(EmbedTokenContext);
  return context?.embedToken;
}
