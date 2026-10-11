import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Mail, Monitor, School, Users, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { createDemoMailto, demoFocuses, demoTimes, demoRequestSchema } from "@/lib/demo-request";

function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ProductDemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState<(typeof demoFocuses)[number]>(demoFocuses[0]);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<(typeof demoTimes)[number]>("12:00");
  const [duration, setDuration] = useState(30);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState(false);
  const reduced = useReducedMotion();
  const icons = [Monitor, School, Users];

  const next = () => {
    setError("");
    if (step === 1 && !date) { setError("Choose your preferred demo date."); return; }
    if (step === 2) {
      const result = demoRequestSchema.safeParse({ focus, date: date ? dateValue(date) : "", time, duration, name, email, organisation });
      if (!result.success) { setError(result.error.issues[0]?.message ?? "Please check your details."); return; }
    }
    setStep((value) => value + 1);
  };

  const send = () => {
    const result = demoRequestSchema.safeParse({ focus, date: date ? dateValue(date) : "", time, duration, name, email, organisation });
    if (!result.success) { setError("Please check your date and contact details."); return; }
    window.location.href = createDemoMailto(result.data);
    setPrepared(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="launch-theme demo-dialog max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-lg border-border bg-background p-6 text-foreground sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> A closer look at Tier2X</div>
        <DialogTitle className="font-sans text-2xl font-semibold tracking-normal">{prepared ? "Your email is ready." : "Let’s make it your demo."}</DialogTitle>
        <DialogDescription>{prepared ? "Send the email in your mail app. Our team will confirm availability; your demo isn’t booked yet." : "Your goals. Your pace. A personal walkthrough of the workspace."}</DialogDescription>
        {!prepared ? <>
          <ol className="my-4 grid grid-cols-4 gap-2" aria-label="Booking progress">
            {["Focus", "Schedule", "Details", "Review"].map((label, index) => <li key={label} className={`border-t-2 pt-2 text-xs ${index <= step ? "border-primary text-primary" : "border-border text-muted-foreground"}`} aria-current={index === step ? "step" : undefined}>{String(index + 1).padStart(2, "0")} {label}</li>)}
          </ol>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: reduced ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : 0.18 }} className="min-h-56">
              {step === 0 && <div className="space-y-3"><h3 className="mb-4 font-sans text-base font-medium">What brings you here?</h3>{demoFocuses.map((option, index) => {
                const Icon = icons[index] ?? Monitor;
                return <Button key={option} variant="outline" onClick={() => setFocus(option)} aria-pressed={focus === option} className={`h-16 w-full justify-start whitespace-normal px-4 ${focus === option ? "border-primary bg-primary/5" : ""}`}><Icon className="mr-2 text-primary" />{option}{focus === option && <Check className="ml-auto text-primary" />}</Button>;
              })}</div>}
              {step === 1 && <div><div className="flex flex-wrap items-start justify-between gap-5"><Calendar mode="single" selected={date} onSelect={setDate} className="p-0" /><div className="min-w-32 flex-1"><h3 className="mb-3 font-sans text-sm">Preferred time · IST</h3><div className="grid grid-cols-2 gap-2">{demoTimes.map((slot) => <Button key={slot} variant={time === slot ? "default" : "outline"} onClick={() => setTime(slot)} aria-pressed={time === slot}>{slot}</Button>)}</div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Requested times are subject to confirmation.</p></div></div><div className="mt-6 border-t border-border pt-4"><label id="duration-label" className="mb-4 flex items-center justify-between text-sm"><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Demo length</span><span className="text-primary">{duration} min</span></label><Slider aria-labelledby="duration-label" value={[duration]} onValueChange={(value) => setDuration(value[0] ?? 30)} min={15} max={45} step={15} /><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Quick look</span><span>Deep dive</span></div></div></div>}
              {step === 2 && <div className="space-y-4"><div><label htmlFor="demo-name" className="mb-2 block text-sm">Your name</label><Input id="demo-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Full name" /></div><div><label htmlFor="demo-email" className="mb-2 block text-sm">Email address</label><Input id="demo-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={255} placeholder="you@example.com" /></div><div><label htmlFor="demo-org" className="mb-2 block text-sm">College / organisation <span className="text-muted-foreground">(optional)</span></label><Input id="demo-org" autoComplete="organization" value={organisation} onChange={(event) => setOrganisation(event.target.value)} maxLength={150} placeholder="Where you study or work" /></div></div>}
              {step === 3 && <div><h3 className="mb-4 font-sans text-base">One last look.</h3><dl className="space-y-3 text-sm">{[["Focus", focus], ["Preferred date", date ? dateValue(date) : ""], ["Time", `${time} IST · ${duration} minutes`], ["Name", name], ["Email", email]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2"><dt className="text-muted-foreground">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl><p className="mt-5 text-xs leading-relaxed text-muted-foreground">This opens an email request addressed to the Tier2X team. Send it to request your demo. No booking is confirmed until the team replies.</p></div>}
            </motion.div>
          </AnimatePresence>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex justify-between gap-3 border-t border-border pt-5"><Button variant="ghost" onClick={() => { setError(""); setStep((value) => value - 1); }} disabled={step === 0}><ArrowLeft /> Back</Button>{step < 3 ? <Button onClick={next}>Continue <ArrowRight /></Button> : <Button onClick={send}><Mail /> Open email request</Button>}</div>
        </> : <div className="py-8"><Mail className="mb-5 h-10 w-10 text-primary" /><p className="text-sm leading-relaxed text-muted-foreground">If your email app didn’t open, you can try again or email campusx4@gmail.com directly.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={send}>Open email again <ArrowRight /></Button><Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button></div></div>}
      </DialogContent>
    </Dialog>
  );
}