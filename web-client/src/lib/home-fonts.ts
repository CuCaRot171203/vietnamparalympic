import localFont from "next/font/local";
import { Be_Vietnam_Pro } from "next/font/google";

export const homeNeusharp = localFont({
  src: "../../public/KV/1FTV-VIP-Neusharp-Bold.ttf",
  weight: "700",
  display: "swap",
  variable: "--font-home-neusharp",
});

export const homeBeVietnam = Be_Vietnam_Pro({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-home-label",
});
