import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1534367507873-d2d7e24c797f")', // Modern gym environment with equipment
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <span className="text-zinc-300 font-semibold mb-2 block">
            The Only App Personal Trainers Will Ever Need
          </span>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Your Coaching Business{" "}
            <span className="bg-gradient-to-r from-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Manage your clients, create workout programmes, track progress, and grow your PT 
            business - all in one place. PTpal is your ultimate coaching companion designed 
            specifically for personal trainers and gym instructors.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/#services">
              <Button
                size="lg"
                variant="outline"
                className="text-lg border-2 hover:bg-white/10 transition-all duration-300"
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}