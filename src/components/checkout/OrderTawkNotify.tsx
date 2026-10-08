"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? "";
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "default";

type Props = {
  name: string;
  email: string;
  phone: string;
  attributes: Record<string, string>;
};

declare global {
  interface Window {
    Tawk_API?: {
      visitor?: { name?: string; email?: string };
      onLoad?: () => void;
      setAttributes?: (
        attrs: Record<string, string>,
        callback?: (error?: unknown) => void,
      ) => void;
      addEvent?: (
        name: string,
        meta?: Record<string, string> | ((error?: unknown) => void),
        callback?: (error?: unknown) => void,
      ) => void;
      addTags?: (tags: string[], callback?: (error?: unknown) => void) => void;
      maximize?: () => void;
      showWidget?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

/**
 * Loads tawk.to on the order-confirmation page and pushes order context
 * so the business dashboard sees a live visitor + custom "order-placed" event.
 */
export function OrderTawkNotify({ name, email, phone, attributes }: Props) {
  const sent = useRef(false);

  const attrsKey = JSON.stringify(attributes);

  useEffect(() => {
    if (!PROPERTY_ID || sent.current) return;

    const attrs: Record<string, string> = {
      ...attributes,
      phone: phone || attributes.phone || "",
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.visitor = {
      name: name || undefined,
      email: email || undefined,
    };

    const pushOrder = () => {
      if (sent.current) return;
      const api = window.Tawk_API;
      if (!api?.setAttributes && !api?.addEvent) return;
      sent.current = true;

      api.setAttributes?.(attrs, () => {});
      api.addTags?.(["new-order", `order-${attrs.orderNumber}`], () => {});
      api.addEvent?.("order-placed", attrs, () => {});
      api.showWidget?.();
      // Maximizing surfaces the visitor in the agent dashboard / mobile app.
      window.setTimeout(() => api.maximize?.(), 600);
    };

    const prevOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = () => {
      prevOnLoad?.();
      pushOrder();
    };

    // Widget may already be loaded from a previous navigation.
    const retry = window.setTimeout(pushOrder, 2500);
    return () => window.clearTimeout(retry);
    // attrsKey covers attributes; avoid re-firing on new object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- attrsKey is the stable signal
  }, [name, email, phone, attrsKey]);

  if (!PROPERTY_ID) return null;

  return (
    <Script id="tawk-to-order-notify" strategy="afterInteractive">
      {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
Tawk_API.visitor={name:${JSON.stringify(name)},email:${JSON.stringify(email)}};
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
