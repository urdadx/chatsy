import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};
export const getPrettyUrl = (url?: string | null) => {
  if (!url) return "";
  // remove protocol (http/https) and www.
  // also remove trailing slash
  return url
    .replace(/(^\w+:|^)\/\//, "")
    .replace("www.", "")
    .replace(/\/$/, "");
};

export function getBaseUrl(url: string) {
  try {
    // Create a URL object
    const parsedUrl = new URL(url);

    // Get the pathname and split it
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment !== "");

    // If no path segments, return just the origin
    if (pathSegments.length === 0) {
      return parsedUrl.origin;
    }

    // Construct the base URL
    return `${parsedUrl.origin}`;
  } catch (error: any) {
    console.error("Error parsing URL:", error.message);
    return null;
  }
}

import ccTLDs from "@/constants/cctlds";
import {
  SECOND_LEVEL_DOMAINS,
  SPECIAL_APEX_DOMAINS,
} from "@/constants/domains";

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export const getApexDomain = (url: string) => {
  let domain: any;
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    return "";
  }
  // special apex domains (e.g. youtu.be)
  if (SPECIAL_APEX_DOMAINS[domain as keyof typeof SPECIAL_APEX_DOMAINS])
    return SPECIAL_APEX_DOMAINS[domain as keyof typeof SPECIAL_APEX_DOMAINS];

  const parts = domain.split(".");
  if (parts.length > 2) {
    // if this is a second-level TLD (e.g. co.uk, .com.ua, .org.tt), we need to return the last 3 parts
    if (
      SECOND_LEVEL_DOMAINS.has(parts[parts.length - 2]) &&
      ccTLDs.has(parts[parts.length - 1])
    ) {
      return parts.slice(-3).join(".");
    }
    // otherwise, it's a subdomain (e.g. dub.vercel.app), so we return the last 2 parts
    return parts.slice(-2).join(".");
  }
  // if it's a normal domain (e.g. dub.sh), we return the domain
  return domain;
};

// Verify the URL entered by user
export const validDomainRegex = new RegExp(
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
);

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const signalIframe = () => {
  const iframe = document.getElementById("preview") as HTMLIFrameElement;
  console.log("iframe", iframe);
  if (iframe) {
    iframe.contentWindow?.postMessage("", "*");
  }
};

export const removeHashFromHexColor = (hexColor: string) => {
  // Use a regular expression to match the # symbol at the beginning
  return hexColor.replace(/^#/, "");
};

export const getCurrentBaseURL = () => {
  if (typeof window !== "undefined") {
    const baseURL = window.location.origin;
    return baseURL;
  }
};

export const getInitials = (name: string | undefined): string => {
  if (!name) return "";

  const words = name.split(" ");
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseCamel<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(parseCamel) as T;
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const newKey = snakeToCamel(key);
      acc[newKey] = parseCamel((obj as any)[key]);
      return acc;
    }, {}) as T;
  }
  return obj;
}

export function parseSnake(input: any): any {
  if (Array.isArray(input)) {
    return input.map((item) => parseSnake(item));
  }

  if (input !== null && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        parseSnake(value),
      ]),
    );
  }

  return input;
}

export async function extractOpenGraphInfo(link: string): Promise<{
  previewImage: string | null;
  previewTitle: string | null;
  previewDescription: string | null;
}> {
  try {
    const response = await fetch(
      `/api/v1/og-preview?url=${encodeURIComponent(link)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      previewImage: data.previewImage,
      previewTitle: data.previewTitle,
      previewDescription: data.previewDescription,
    };
  } catch (error) {
    console.error("Error extracting OpenGraph info:", error);
    return {
      previewImage: null,
      previewTitle: null,
      previewDescription: null,
    };
  }
}
