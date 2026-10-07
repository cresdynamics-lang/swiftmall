"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? "";
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "default";

/**
 * tawk.to live chat widget.
 * Set NEXT_PUBLIC_TAWK_PROPERTY_ID (+ optional NEXT_PUBLIC_TAWK_WIDGET_ID) in .env
 * from https://dashboard.tawk.to → Administration → Chat Widget.
 */
export function TawkChat() {
  const pathname = usePathname();
  if (!PROPERTY_ID) return null;
  if (pathname.startsWith("/checkout") || pathname.startsWith("/management")) return null;

  return (
    <Script id="tawk-to" strategy="lazyOnload">
      {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
    </Script>
  );
}
