import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js";
import { ShieldCheck, Camera, RotateCcw, CheckCircle2, XCircle, Loader2, Lock, Languages, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractDOB, calculateAge, MIN_AGE, preprocessImage } from "@/utils/ageVerification";
import { t, type Lang } from "@/i18n/translations";

type Step = "landing" | "camera" | "processing" | "approved" | "rejected" | "error";

const Index = () => {
  const [step, setStep] = useState<Step>("landing");
  const [lang, setLang] = useState<Lang>("en");
  const [progress, setProgress] = useState(0);
  const [age, setAge] = useState<number | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const tr = t[lang];

  const reset = () => {
    setStep("landing");
    setProgress(0);
    setAge(null);
    setDob(null);
    setErrorMsg("");
    setVerifiedAt(null);
  };

  const processImage = useCallback(async (imageSrc: string) => {
    setStep("processing");
    setProgress(0);
    try {
      const processed = await preprocessImage(imageSrc);
      const result = await Tesseract.recognize(processed, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const dobDate = extractDOB(result.data.text);
      if (!dobDate) {
        setErrorMsg(tr.noDob);
        setStep("error");
        return;
      }
      const userAge = calculateAge(dobDate);
      setDob(dobDate);
      setAge(userAge);
      setVerifiedAt(new Date());
      setStep(userAge >= MIN_AGE ? "approved" : "rejected");
    } catch (e) {
      setErrorMsg("OCR failed. Please retry.");
      setStep("error");
    }
  }, [tr.noDob]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) processImage(imageSrc);
  }, [processImage]);

  // Cleanup: ensure no image data lingers
  useEffect(() => {
    return () => {
      setDob(null);
      setAge(null);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Lang toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "ta" : "en")}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm hover:border-primary transition"
      >
        <Languages className="w-4 h-4" />
        {lang === "en" ? "தமிழ்" : "English"}
      </button>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto w-32 h-32 rounded-full bg-card border-2 border-primary glow-cyan flex items-center justify-center"
              >
                <ShieldCheck className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-glow-cyan tracking-tight">
                  {tr.title}
                </h1>
                <p className="text-xl text-muted-foreground">{tr.subtitle}</p>
              </div>
              <Button
                size="lg"
                onClick={() => setStep("camera")}
                className="h-16 px-12 text-lg rounded-full glow-cyan"
              >
                <Camera className="w-6 h-6 mr-2" />
                {tr.start}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-8">
                <Lock className="w-3 h-3" />
                <span>{tr.privacy}</span>
              </div>
            </motion.div>
          )}

          {step === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-center">{tr.instructions}</h2>
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary glow-cyan aspect-[4/3] bg-black">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  onUserMediaError={() => {
                    setErrorMsg(tr.cameraDenied);
                    setStep("error");
                  }}
                  className="w-full h-full object-cover"
                />
                {/* Frame overlay */}
                <div className="absolute inset-8 border-2 border-primary/70 rounded-lg pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary" />
                </div>
                {/* Scan line */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="scan-line h-24 w-full" />
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="lg" onClick={reset}>
                  Cancel
                </Button>
                <Button size="lg" onClick={capture} className="glow-cyan px-10">
                  <ScanLine className="w-5 h-5 mr-2" />
                  {tr.capture}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 py-12"
            >
              <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-glow-cyan">{tr.processing}</h2>
                <p className="text-muted-foreground">{tr.extracting}</p>
              </div>
              <div className="max-w-sm mx-auto">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ boxShadow: "0 0 20px hsl(190 100% 55%)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-sm text-primary font-mono">{progress}%</p>
              </div>
            </motion.div>
          )}

          {step === "approved" && age !== null && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-6"
            >
              <div className="rounded-3xl border-2 border-success bg-card glow-green p-10 space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-28 h-28 text-success mx-auto" style={{ filter: "drop-shadow(0 0 20px hsl(142 90% 45%))" }} />
                </motion.div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-glow-green text-success">{tr.approved}</h2>
                  <p className="text-xl text-muted-foreground mt-2">{tr.eligible}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{tr.age}</p>
                    <p className="text-2xl font-bold text-success">{age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{tr.dob}</p>
                    <p className="text-2xl font-bold">{dob?.toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                {verifiedAt && (
                  <p className="text-xs text-muted-foreground">
                    {tr.verifiedAt}: {verifiedAt.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button size="lg" onClick={reset} className="bg-success text-success-foreground hover:bg-success/90 glow-green">
                  {tr.proceed}
                </Button>
                <Button size="lg" variant="outline" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {tr.verifyAnother}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "rejected" && age !== null && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-6"
            >
              <div className="rounded-3xl border-2 border-destructive bg-card glow-red p-10 space-y-6 animate-shake">
                <XCircle className="w-28 h-28 text-destructive mx-auto" style={{ filter: "drop-shadow(0 0 20px hsl(0 90% 55%))" }} />
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-glow-red text-destructive">{tr.rejected}</h2>
                  <p className="text-xl text-muted-foreground mt-2">{tr.rejectedSub}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{tr.age}</p>
                    <p className="text-2xl font-bold text-destructive">{age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{tr.dob}</p>
                    <p className="text-2xl font-bold">{dob?.toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={reset} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <RotateCcw className="w-4 h-4 mr-2" />
                {tr.retry}
              </Button>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <XCircle className="w-20 h-20 text-destructive mx-auto" />
              <p className="text-xl">{errorMsg}</p>
              <Button size="lg" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {tr.retry}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
