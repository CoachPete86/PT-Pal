import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Branding } from "@shared/schema";

type BrandingContextType = {
  branding: Branding | null;
  isLoading: boolean;
  error: Error | null;
  updateBranding: (data: Partial<Branding>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
};

const BrandingContext = createContext<BrandingContextType | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: branding,
    error,
    isLoading,
  } = useQuery<Branding | null>({
    queryKey: ["/api/branding"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const updateBrandingMutation = useMutation({
    mutationFn: async (data: Partial<Branding>) => {
      const res = await apiRequest("PATCH", "/api/branding", data);
      return res.json();
    },
    onSuccess: (updatedBranding: Branding) => {
      queryClient.setQueryData(["/api/branding"], updatedBranding);
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await apiRequest("POST", "/api/branding/logo", formData);
      return res.json();
    },
    onSuccess: (updatedBranding: Branding) => {
      queryClient.setQueryData(["/api/branding"], updatedBranding);
      toast({
        title: "Logo uploaded",
        description: "Your logo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBranding = async (data: Partial<Branding>) => {
    await updateBrandingMutation.mutateAsync(data);
  };

  const uploadLogo = async (file: File) => {
    await uploadLogoMutation.mutateAsync(file);
  };

  return (
    <BrandingContext.Provider
      value={{
        branding: branding ?? null,
        isLoading,
        error,
        updateBranding,
        uploadLogo,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  welcomeMessage: string;
}

export function useBranding() {
  const { user } = useAuth();

  const { data: branding } = useQuery({
    queryKey: ['/api/branding'],
    enabled: !!user,
  });

  const updateBranding = useMutation({
    mutationFn: async (settings: Partial<BrandingSettings>) => {
      const res = await fetch('/api/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update branding');
      return res.json();
    },
  });

  return {
    branding,
    updateBranding,
  };
}
