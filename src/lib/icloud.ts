const ICLOUD_DOMAINS = ["icloud.com", "me.com", "mac.com"];

export function isICloudEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  return !!domain && ICLOUD_DOMAINS.includes(domain);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}