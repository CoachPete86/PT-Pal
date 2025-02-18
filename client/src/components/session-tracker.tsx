
import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SessionPackage, CompletedSession } from '@shared/schema';

export default function SessionTracker() {
  const trainerPadRef = useRef<SignaturePad>(null);
  const clientPadRef = useRef<SignaturePad>(null);
  const [notes, setNotes] = useState('');
  
  const { data: packages } = useQuery<SessionPackage[]>({
    queryKey: ['/api/session-packages'],
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (data: {
      packageId: number;
      notes: string;
      trainerSignature: string;
      clientSignature: string;
    }) => {
      const res = await apiRequest('POST', '/api/complete-session', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session-packages'] });
      trainerPadRef.current?.clear();
      clientPadRef.current?.clear();
      setNotes('');
    },
  });

  const handleCompleteSession = async (packageId: number) => {
    if (!trainerPadRef.current?.isEmpty() && !clientPadRef.current?.isEmpty()) {
      await completeSessionMutation.mutate({
        packageId,
        notes,
        trainerSignature: trainerPadRef.current?.toDataURL(),
        clientSignature: clientPadRef.current?.toDataURL(),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {packages?.map((pkg) => (
            <div key={pkg.id} className="mb-6 p-4 border rounded-lg">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    Sessions: {pkg.remainingSessions}/{pkg.totalSessions}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Purchased: {new Date(pkg.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleCompleteSession(pkg.id)}
                  disabled={pkg.remainingSessions === 0}
                >
                  Complete Session
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Session Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter session notes..."
                  />
                </div>

                <div>
                  <Label>Trainer Signature</Label>
                  <div className="border rounded-lg h-40 bg-white">
                    <SignaturePad
                      ref={trainerPadRef}
                      canvasProps={{
                        className: 'w-full h-full',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Client Signature</Label>
                  <div className="border rounded-lg h-40 bg-white">
                    <SignaturePad
                      ref={clientPadRef}
                      canvasProps={{
                        className: 'w-full h-full',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
