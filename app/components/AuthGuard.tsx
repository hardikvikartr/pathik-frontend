"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SecureStorage } from "../utils/secureStorage";

const PUBLIC_PATHS = ["/", "/hotel", "/police", "/sys-admin"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = SecureStorage.getItem("token");
    const user = SecureStorage.getItem("user");
    // console.log(user, token);
    if (token) {
      if (PUBLIC_PATHS.includes(pathname)) {
        router.replace("/dashboard");
      } else {
        setAuthorized(true);
      }
    } else {
      if (pathname.startsWith("/dashboard")) {
        router.replace("/");
      } else {
        setAuthorized(true);
      }
    }
  }, [pathname, router]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
