import React, { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText,
  CalendarCheck,
  Download,
  RefreshCw,
  Clock,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SessionPackage } from "@shared/schema";
import { motion } from "framer-motion";
import {
  AnimatedButton,
  AnimatedCard,
  FadeIn,
  CollapsibleSection,
  SuccessAnimation,
} from "@/components/ui/animated-elements";

export default function SessionTracker() {
  const { toast } = useToast();
  const signaturePadRef = useRef<SignaturePad>(null);
  const trainerSignaturePadRef = useRef<SignaturePad>(null);
  const [notes, setNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [duration, setDuration] = useState("60");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const {
    data: packages,
    isLoading,
    error,
  } = useQuery<SessionPackage[]>({
    queryKey: ["/api/session-packages"],
    retry: false,
    onError: (err) => {
      toast({
        title: "Error loading session packages",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (data: {
      packageId: number;
      notes: string;
      signature: string;
      clientName: string;
      sessionDate: string;
      duration: string;
    }) => {
      const res = await apiRequest("POST", "/api/complete-session", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-packages"] });
      signaturePadRef.current?.clear();
      setNotes("");
      setClientName("");
      toast({
        title: "Session completed",
        description: "The session has been successfully recorded.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error completing session",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleCompleteSession = async (packageId: number) => {
    if (!signaturePadRef.current?.isEmpty() && clientName) {
      // Get client signature
      const clientSignature = signaturePadRef.current?.toDataURL();

      // Get trainer signature (you'll need to add another SignaturePad for trainer)
      const trainerSignature = trainerSignaturePadRef.current?.toDataURL();

      if (!clientSignature || !trainerSignature) {
        toast({
          title: "Missing signatures",
          description: "Both client and trainer signatures are required.",
          variant: "destructive",
        });
        return;
      }

      try {
        await completeSessionMutation.mutate({
          packageId,
          notes,
          clientSignature,
          trainerSignature,
          clientName,
          sessionDate,
          duration: parseInt(duration),
          verificationCode: Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase(),
        });

        toast({
          title: "Session completed",
          description: "Session has been logged successfully",
        });

        // Reset form
        setNotes("");
        setClientName("");
        setSessionDate(new Date().toISOString().split("T")[0]);
        setDuration("60");
        clearSignature();
      } catch (error: any) {
        toast({
          title: "Error completing session",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  if (isLoading) {
    return (
      <div className="flex items-centre justify-centre min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !packages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-centre gap-2">
            <CalendarCheck className="h-5 w-5" />
            Session Tracking
          </CardTitle>
          <CardDescription>
            No active session packages found. Please create a session package
            first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-centre gap-2">
            <CalendarCheck className="h-5 w-5" />
            Session Tracking
          </CardTitle>
          <CardDescription>
            No active session packages available.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatedCard>
        <CardHeader>
          <CardTitle className="flex items-centre gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 500, damping: 10 }}
            >
              <CalendarCheck className="h-5 w-5 text-primary" />
            </motion.div>
            Session Tracking
          </CardTitle>
          <CardDescription>
            Record completed sessions and collect client signatures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages &&
            packages.map((pkg: any, index: number) => (
              <FadeIn key={pkg.id} delay={index * 0.1}>
                <AnimatedCard className="mb-6 overflow-hidden" hover={false}>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="font-semibold flex items-centre gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            Remaining Sessions: {pkg.remainingSessions}/
                            {pkg.totalSessions}
                          </motion.span>
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-centre gap-2 mt-1">
                          <Clock className="h-4 w-4" />
                          Purchased:{" "}
                          {new Date(
                            pkg.purchaseDate || Date.now(),
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>

                    <CollapsibleSection
                      title="Session Details"
                      defaultOpen={true}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                        <div>
                          <Label className="flex items-centre gap-1">
                            <User className="h-4 w-4" />
                            Client Name
                          </Label>
                          <Input
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Enter client name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="flex items-centre gap-1">
                            <CalendarCheck className="h-4 w-4" />
                            Session Date
                          </Label>
                          <Input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="flex items-centre gap-1">
                            <Clock className="h-4 w-4" />
                            Duration (minutes)
                          </Label>
                          <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            min="15"
                            max="180"
                            step="15"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label>Session Notes</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter session details, achievements, and plans for next session..."
                          className="h-24 mt-1"
                        />
                      </div>

                      <div>
                        <div className="flex items-centre justify-between mb-2">
                          <Label className="flex items-centre gap-2">
                            Client Signature
                            <span className="text-xs text-muted-foreground">
                              (required)
                            </span>
                          </Label>
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            onClick={clearSignature}
                            className="flex items-centre gap-1"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Clear
                          </AnimatedButton>
                        </div>
                        <motion.div
                          className="border rounded-lg h-40 bg-white touch-none overflow-hidden"
                          whileHover={{
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <SignaturePad
                            ref={signaturePadRef}
                            canvasProps={{
                              className: "w-full h-full",
                            }}
                          />
                        </motion.div>
                      </div>
                    </CollapsibleSection>

                    <motion.div
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <AnimatedButton
                        variant="outline"
                        onClick={() => {
                          if (!signaturePadRef.current?.isEmpty()) {
                            const dataUrl =
                              signaturePadRef.current?.toDataURL();
                            const a = document.createElement("a");
                            a.href = dataUrl;
                            a.download = `signature-${clientName}-${sessionDate}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                        }}
                        className="flex items-centre gap-2"
                        disabled={
                          !signaturePadRef.current ||
                          signaturePadRef.current.isEmpty()
                        }
                      >
                        <Download className="h-4 w-4" />
                        Save Signature
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => {
                          setShowSuccessAnimation(true);
                          setTimeout(() => {
                            setShowSuccessAnimation(false);
                            handleCompleteSession(pkg.id);
                          }, 800);
                        }}
                        disabled={
                          pkg.remainingSessions === 0 ||
                          !clientName ||
                          !signaturePadRef.current ||
                          signaturePadRef.current.isEmpty() ||
                          completeSessionMutation.isPending
                        }
                        className="flex items-centre gap-2 relative"
                      >
                        {showSuccessAnimation && (
                          <motion.div
                            className="absolute inset-0 flex items-centre justify-centre bg-primary rounded-md"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                          </motion.div>
                        )}
                        {completeSessionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CalendarCheck className="h-4 w-4" />
                        )}
                        Complete Session
                      </AnimatedButton>
                    </motion.div>
                  </CardContent>
                </AnimatedCard>
              </FadeIn>
            ))}
        </CardContent>
      </AnimatedCard>
    </motion.div>
  );
}
