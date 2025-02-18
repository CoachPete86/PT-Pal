import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  FileText, 
  CalendarCheck, 
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';
import type { SessionPackage, CompletedSession } from '@shared/schema';

export default function SessionTracker() {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('60');

  const { data: packages, isLoading } = useQuery<SessionPackage[]>({
    queryKey: ['/api/session-packages'],
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
      const res = await apiRequest('POST', '/api/complete-session', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session-packages'] });
      signaturePadRef.current?.clear();
      setNotes('');
      setClientName('');
    },
  });

  const handleCompleteSession = async (packageId: number) => {
    if (!signaturePadRef.current?.isEmpty() && clientName) {
      await completeSessionMutation.mutate({
        packageId,
        notes,
        signature: signaturePadRef.current?.toDataURL(),
        clientName,
        sessionDate,
        duration,
      });
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Session Tracking
          </CardTitle>
          <CardDescription>
            Record completed sessions and collect client signatures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages?.map((pkg) => (
            <div key={pkg.id} className="mb-6 p-4 border rounded-lg bg-card">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Remaining Sessions: {pkg.remainingSessions}/{pkg.totalSessions}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    Purchased: {new Date(pkg.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <Label>Session Date</Label>
                    <Input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="15"
                      max="180"
                      step="15"
                    />
                  </div>
                </div>

                <div>
                  <Label>Session Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter session details, achievements, and plans for next session..."
                    className="h-24"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Client Signature</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearSignature}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                  <div className="border rounded-lg h-40 bg-white touch-none">
                    <SignaturePad
                      ref={signaturePadRef}
                      canvasProps={{
                        className: 'w-full h-full',
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!signaturePadRef.current?.isEmpty()) {
                        const dataUrl = signaturePadRef.current?.toDataURL();
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = `signature-${clientName}-${sessionDate}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Save Signature
                  </Button>
                  <Button
                    onClick={() => handleCompleteSession(pkg.id)}
                    disabled={pkg.remainingSessions === 0 || !clientName || signaturePadRef.current?.isEmpty()}
                    className="flex items-center gap-2"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Complete Session
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}