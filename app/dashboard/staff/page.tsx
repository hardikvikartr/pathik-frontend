import { staffService } from "@/app/services/staffService";
import StaffClient from "./StaffClient";

export default async function StaffListPage() {
  // Server-side fetch
  // In Mock Mode (server-side), this will return [] because of the check we added.
  // In Real API Mode, this would fetch the actual data on the server.
  const data = await staffService.getAllStaff();
  
  return <StaffClient initialData={data} />;
}
