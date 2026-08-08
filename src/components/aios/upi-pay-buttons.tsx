import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Smartphone, QrCode } from "lucide-react";
import {
  UPI_APPS,
  UPI_ID,
  buildAppUpiLink,
  buildUpiLink,
  isMobileDevice,
  makeTxnRef,
} from "@/lib/upi";

/**
 * One-tap UPI payment launcher: opens PhonePe / GPay / Paytm / Amazon Pay /
 * Navi / super.money directly with the amount pre-filled, plus a QR for desktop.
 */
export function UpiPayButtons({
  amount,
  note,
  onLaunched,
}: {
  amount: number;
  note: string;
  onLaunched?: (txnRef: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const txnRef = useMemo(() => makeTxnRef(), []);
  const mobile = isMobileDevice();
  const genericLink = buildUpiLink({ amount, note, txnRef });

  const pay = (href: string) => {
    onLaunched?.(txnRef);
    window.location.href = href;
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {UPI_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => pay(buildAppUpiLink(app, { amount, note, txnRef }))}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-2 py-3 text-center transition hover:border-gold/40 hover:bg-gold/5"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: app.color }}
            >
              {app.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground group-hover:text-foreground">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent"
        >
          <QrCode className="h-3.5 w-3.5" />
          {showQr ? "Hide QR" : "Show UPI QR"}
        </button>
        <button
          type="button"
          onClick={copyUpi}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "UPI ID copied" : `Copy ${UPI_ID}`}
        </button>
      </div>

      {showQr && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
          <QRCodeCanvas value={genericLink} size={168} includeMargin bgColor="#ffffff" fgColor="#000000" />
          <p className="text-[11px] text-muted-foreground">
            Scan with any UPI app — amount ₹{amount.toLocaleString("en-IN")} is pre-filled.
          </p>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Smartphone className="mt-0.5 h-3 w-3 shrink-0" />
        {mobile
          ? "Tap an app above to pay instantly, then come back and paste the transaction ID."
          : "App buttons open on a phone. On desktop, scan the QR with your UPI app."}
      </p>
    </div>
  );
}
