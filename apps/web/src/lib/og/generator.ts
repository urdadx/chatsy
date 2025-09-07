import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "@vercel/og";

async function loadFont(font: string, text: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }
  throw new Error("failed to load font data");
}

export async function generateOGImage() {
  const brandName = "Padyna";
  const mainText = "AI-driven customer support agents for your business";

  const assetsPrefix =
    process.env.NODE_ENV === "development" ? "./public" : "./dist";
  const logoBuffer = fs.readFileSync(path.resolve(assetsPrefix, "logo.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  // Logo/Brand element (top-left)
  const logoElement = {
    type: "div",
    props: {
      tw: "absolute top-8 left-8 flex items-center gap-3",
      children: [
        // Your PNG logo as base64
        {
          type: "img",
          props: {
            tw: "w-10 h-10",
            src: logoBase64,
            alt: "Padyna Logo",
          },
        },
        // Brand name
        {
          type: "div",
          props: {
            tw: "text-2xl font-bold text-gray-900 pl-3",
            style: {
              fontFamily: "Inter",
            },
            children: brandName,
          },
        },
      ],
    },
  };

  // Grid pattern background
  const gridElement = {
    type: "div",
    props: {
      tw: "w-full h-full absolute inset-0",
      style: {
        backgroundImage:
          "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
        backgroundSize: "70px 70px",
      },
    },
  };

  // Left radial gradient
  const leftGradientElement = {
    type: "div",
    props: {
      tw: "w-full h-full absolute inset-0",
      style: {
        background:
          "radial-gradient(circle at left, rgba(251,146,60,0.05), rgba(139,92,246,0.05), transparent 50%)",
      },
    },
  };

  // Right radial gradient
  const rightGradientElement = {
    type: "div",
    props: {
      tw: "w-full h-full absolute inset-0",
      style: {
        background:
          "radial-gradient(circle at right, rgba(251,146,60,0.05), rgba(139,92,246,0.05), transparent 50%)",
      },
    },
  };

  // Main heading text
  const mainHeadingElement = {
    type: "div",
    props: {
      tw: "text-7xl font-bold text-gray-900 leading-normal max-w-5xl text-left",
      style: {
        fontFamily: "Inter",
      },
      children: mainText,
    },
  };

  // Main content container
  const contentContainer = {
    type: "div",
    props: {
      tw: "flex items-center justify-start p-5 relative z-10",
      children: [mainHeadingElement],
    },
  };

  // Main background (white base)
  const baseBackgroundElement = {
    type: "div",
    props: {
      tw: "w-full h-full absolute inset-0",
      style: {
        background: "#ffffff",
      },
    },
  };

  // Main HTML structure
  const html = {
    type: "div",
    props: {
      tw: "relative w-full h-full flex items-center justify-center",
      children: [
        baseBackgroundElement,
        gridElement,
        leftGradientElement,
        rightGradientElement,
        logoElement,
        contentContainer,
      ],
    },
  };

  // Load fonts
  const fonts = await Promise.all([
    {
      name: "Inter",
      data: await loadFont("Inter", `${brandName} ${mainText} `, 400),
      style: "normal" as const,
      weight: 400,
    },
    {
      name: "Inter",
      data: await loadFont("Inter", `${brandName} ${mainText}`, 700),
      style: "normal" as const,
      weight: 700,
    },
  ]);

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts,
  });
}
