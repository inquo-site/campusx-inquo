import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Check, Upload, Loader2, X, ShieldCheck, Clock, XCircle } from "lucide-react";

const UPI_ID = "inquosite12@okhdfcbank";
const AMOUNT = 999;

export function AutopilotActivateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["my-autopilot-sub", user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (!open) return null;

  const pending = existing?.status === "pending";
  const approved = existing?.status === "approved";
  const rejected = existing?.status === "rejected";

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submit = async () => {
    if (!user) return;
    if (!txnId.trim()) {
      toast.error("UPI transaction ID daaliye");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("payment-proofs")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        screenshotUrl = signed?.signedUrl ?? path;
      }
      const { error } = await supabase.from("agent_subscriptions").insert({
        user_id: user.id,
        upi_txn_id: txnId.trim(),
        screenshot_url: screenshotUrl,
        amount_inr: AMOUNT,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Payment submitted — admin verification pending");
      qc.invalidateQueries({ queryKey: ["my-autopilot-sub"] });
      setTxnId("");
      setFile(null);
    } catch (e: any) {
      toast.error(e.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/20 bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border bg-surface p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border p-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— AI Autopilot</div>
          <h3 className="mt-2 font-display text-2xl">Activate all 7 agents</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ₹{AMOUNT}/month · Manual UPI payment
          </p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : approved ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
              <h4 className="mt-3 font-display text-lg">Autopilot Active</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                All 7 agents are running on your workspace.
              </p>
            </div>
          ) : pending ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
                <Clock className="mx-auto h-7 w-7 text-amber-500" />
                <h4 className="mt-3 font-display text-lg">Verification pending</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admin aapke payment ko verify kar rahe hain. Usually within 24 hrs.
                </p>
                <div className="mt-4 space-y-1 text-left text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Txn ID</span><span className="font-mono">{existing?.upi_txn_id}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{new Date(existing!.created_at).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {rejected && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs">
                  <div className="flex items-start gap-2 text-rose-400">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-medium">Previous request rejected</div>
                      {existing?.admin_note && <div className="mt-1 text-muted-foreground">{existing.admin_note}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: UPI */}
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Step 1 — Pay ₹{AMOUNT} via UPI</div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">UPI ID</div>
                    <div className="mt-1 font-mono text-base text-foreground">{UPI_ID}</div>
                  </div>
                  <button
                    onClick={copyUpi}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-background px-3 py-2 text-xs font-medium hover:bg-gold/10"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Kisi bhi UPI app (GPay / PhonePe / Paytm) se ₹{AMOUNT} bhejiye.
                </p>
              </div>

              {/* Step 2: proof */}
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Step 2 — Submit proof</div>
                <label className="mt-3 block text-xs font-medium">UPI Transaction ID *</label>
                <input
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. 424318273645"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-gold/50 focus:outline-none"
                />

                <label className="mt-4 block text-xs font-medium">Payment screenshot (optional)</label>
                <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted-foreground hover:border-gold/40">
                  <Upload className="h-4 w-4" />
                  <span className="truncate">{file ? file.name : "Upload screenshot (PNG/JPG)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <button
                onClick={submit}
                disabled={submitting || !txnId.trim()}
                className="btn-ink group w-full justify-center disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for verification"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Admin will manually verify. Approve hone par 7 agents unlock ho jayenge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
