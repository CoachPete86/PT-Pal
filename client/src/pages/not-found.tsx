import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist or you may not have access.
          </p>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Try these pages instead:</p>
            <ul className="list-disc pl-5 text-sm text-blue-600">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
