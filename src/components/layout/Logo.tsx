import Image from "next/image";
import Link from "next/link";
import { storeConfig } from "@/lib/store-config";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
};

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return (
      <Link href="/" className={`inline-flex shrink-0 ${className}`} aria-label={storeConfig.name}>
        <Image
          src={storeConfig.logo.icon}
          alt={storeConfig.name}
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label={storeConfig.name}>
      <Image
        src={storeConfig.logo.full}
        alt={`${storeConfig.name} - ${storeConfig.tagline}`}
        width={200}
        height={48}
        className="h-10 w-auto object-contain sm:h-11"
        priority
      />
    </Link>
  );
}
