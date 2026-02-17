import { useCode } from "@/hooks/use-code";
import { GlassCard } from "@/components/GlassCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Copy, Check, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

const LOADING_MESSAGES = [
  "Initializing secure connection...",
  "Syncing with Member Net nodes...",
  "Verifying Discord handshake...",
  "Generating unique verification hash...",
  "Securing your ephemeral session...",
  "Redirecting to vault..."
];

export default function VerificationPage() {
  const { data, isLoading: isDataLoading, error, refetch } = useCode();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loadingProgress < 100) {
      const timeout = setTimeout(() => {
        const nextProgress = loadingProgress + Math.floor(Math.random() * 15) + 5;
        setLoadingProgress(Math.min(nextProgress, 100));
        
        // Randomly update message
        if (Math.random() > 0.7) {
          setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * (LOADING_MESSAGES.length - 1))]);
        }
      }, Math.random() * 300 + 100);
      return () => clearTimeout(timeout);
    } else {
      setLoadingMessage(LOADING_MESSAGES[LOADING_MESSAGES.length - 1]);
      setShowRedirect(true);
      const timeout = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [loadingProgress]);

  const handleCopy = async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });
      toast({
        title: "Copied to clipboard",
        description: "Submit this code in the Discord verification channel.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the code manually.",
      });
    }
  };

  if (!isFullyLoaded || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden font-sans">
        <AnimatePresence mode="wait">
          {!isFullyLoaded && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center max-w-sm w-full"
            >
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white font-mono">{loadingProgress}%</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter">MEMBER NET</h1>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              <p className="text-muted-foreground text-sm font-medium h-4">
                {showRedirect ? "Redirecting to your code..." : loadingMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md text-center">
          <ShieldCheck className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">{(error as Error).message || "System error generating code."}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Retry Connection
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-black to-blue-950/20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold tracking-[0.3em] text-primary/80 uppercase mb-2">Member Net Verification</h2>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4">
            MEMBER NET
          </h1>
          <div className="h-0.5 w-12 bg-primary mx-auto rounded-full" />
        </div>

        <GlassCard className="text-center overflow-visible">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="w-12 h-12 bg-background border border-white/10 rounded-xl flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>

          <p className="text-muted-foreground mt-4 mb-8">
            Your unique access key has been generated and is valid for this session.
          </p>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-8 mb-8 relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">Secure Access Key</span>
              <div className="font-mono text-4xl md:text-5xl font-bold text-white tracking-[0.15em] mb-6 text-glow">
                {data?.code}
              </div>
              <div className="flex items-center justify-center gap-2 border-t border-white/5 pt-4">
                {data && <CountdownTimer expiresAt={data.expiresAt} />}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleCopy}
              className={`h-14 text-lg font-bold transition-all duration-300 ${
                copied ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {copied ? (
                <><Check className="w-5 h-5 mr-2" /> COPIED</>
              ) : (
                <><Copy className="w-5 h-5 mr-2" /> COPY KEY</>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white"
              onClick={() => window.open("https://discord.com", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> OPEN DISCORD
            </Button>
          </div>

          <p className="mt-8 text-[10px] text-muted-foreground/40 uppercase tracking-widest">
            System: Verification v2.4.0 • Region: Global
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
