"use client";

import { usePathname } from "next/navigation";
import { storeConfig } from "@/lib/store-config";

export function WhatsAppFloat({ productLabel }: { productLabel?: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return null;

  const number = storeConfig.whatsappNumber.replace(/\D/g, "");
  const text = productLabel
    ? `Hi Swifmall, I’m asking about: ${productLabel}`
    : "Hi Swifmall, I have a question about an order / product.";
  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : "#";

  return (
    <a
      href={href}
      target={number ? "_blank" : undefined}
      rel={number ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!number) {
          e.preventDefault();
          alert("WhatsApp number will be added soon.");
        }
      }}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 md:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.82 1.5 5.46L2 22l4.9-1.58a10 10 0 0 0 5.14 1.4h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.76 13.96c-.24.68-1.4 1.24-1.93 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.78-4.17-4.93-4.36-.14-.2-1.2-1.6-1.2-3.05 0-1.46.76-2.18 1.03-2.47.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.07.89 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.44.12.6-.07.17-.2.7-.81.89-1.09.18-.28.37-.23.62-.14.25.1 1.58.75 1.85.88.27.14.45.2.52.31.07.11.07.64-.17 1.32z" />
    </svg>
  );
}
