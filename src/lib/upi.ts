export const UPI_ID = "inquosite12@okhdfcbank";
export const UPI_PAYEE_NAME = "Campus X";

export type UpiApp = {
  id: string;
  name: string;
  /** URL scheme prefix; the standard upi://pay query is appended. */
  scheme: string;
  color: string;
};

/**
 * Indian UPI apps that support the standard `pay?` intent query.
 * Deep links only work on a phone with the app installed.
 */
export const UPI_APPS: UpiApp[] = [
  { id: "phonepe", name: "PhonePe", scheme: "phonepe://pay", color: "#5f259f" },
  { id: "gpay", name: "Google Pay", scheme: "tez://upi/pay", color: "#1a73e8" },
  { id: "paytm", name: "Paytm", scheme: "paytmmp://pay", color: "#00baf2" },
  { id: "amazonpay", name: "Amazon Pay", scheme: "amazonToAlipay://pay", color: "#ff9900" },
  { id: "navi", name: "Navi UPI", scheme: "navi://pay", color: "#0f6fff" },
  { id: "supermoney", name: "super.money", scheme: "supermoney://pay", color: "#00c853" },
  { id: "bhim", name: "BHIM", scheme: "bhim://pay", color: "#f26522" },
  { id: "any", name: "Any UPI app", scheme: "upi://pay", color: "#8a8a8a" },
];

export function buildUpiQuery(opts: {
  amount: number;
  note: string;
  txnRef?: string;
  pa?: string;
  pn?: string;
}) {
  const params = new URLSearchParams({
    pa: opts.pa ?? UPI_ID,
    pn: opts.pn ?? UPI_PAYEE_NAME,
    am: String(opts.amount),
    cu: "INR",
    tn: opts.note.slice(0, 50),
  });
  if (opts.txnRef) params.set("tr", opts.txnRef);
  return params.toString();
}

/** Generic upi:// link — used for the QR code and desktop copy. */
export function buildUpiLink(opts: Parameters<typeof buildUpiQuery>[0]) {
  return `upi://pay?${buildUpiQuery(opts)}`;
}

/** App-specific deep link (opens that app directly on mobile). */
export function buildAppUpiLink(app: UpiApp, opts: Parameters<typeof buildUpiQuery>[0]) {
  return `${app.scheme}?${buildUpiQuery(opts)}`;
}

export function makeTxnRef(prefix = "CX") {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}
