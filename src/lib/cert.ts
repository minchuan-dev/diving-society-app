import type { CertLevel } from "@/generated/prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function formatCert(cert: CertLevel, dict: Dictionary) {
  return dict.trips.certs[cert];
}