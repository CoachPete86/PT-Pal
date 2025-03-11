
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const { user, login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (user) {
      setStatus(`Logged in as: ${user.email}`);
    } else {
      setStatus("Not logged in");
    }
  }, [user]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Attempting login...");
    
    try {
      await login(email, password);
      setStatus("Login successful");
      setTimeout(() => setLocation("/dashboard"), 1000);
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <p className="font-mono text-sm">Status: {status}</p>
            <p className="font-mono text-sm mt-2">
              Session state: {user ? "Authenticated" : "Not authenticated"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
