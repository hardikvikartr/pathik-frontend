"use client";

import { useSearchParams } from "next/navigation";
import ForgotPasswordScreen from "../components/ForgotPasswordScreen";


export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  if (role !== "POLICE" && role !== "HOTEL") {
    return <div>Invalid Access</div>;
  }

  return <ForgotPasswordScreen portalType={role} />;
}
 