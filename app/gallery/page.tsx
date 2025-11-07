import PermissionGate from "@/components/permissions/PermissionGate";
import GalleryClient from "./GalleryClient";
import PasswordProtection from "./components/PasswordProtection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GalleryPage() {
  return (
    <PermissionGate permission="gallery">
      <PasswordProtection>
        <GalleryClient />
      </PasswordProtection>
    </PermissionGate>
  );
}

