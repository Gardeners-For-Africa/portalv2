import { AlertCircle, Building, Lock, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLogo } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, rememberMe);
    if (success) {
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540151812223-c30b3fab58e6')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-green-900/70"></div>

      <div className="w-full relative max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left text-primary-foreground space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <PortalLogo size={32} className="text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-poppins font-bold">Gardeners for Africa</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-poppins font-semibold max-w-md md:mx-auto">
              Welcome to the Future of Education Management
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md md:mx-auto">
              Streamline your school operations with our comprehensive management system. Connect
              students, teachers, parents, and administrators in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md md:mx-auto">
            <div className="bg-primary-foreground/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">15K+</div>
              <div className="text-sm text-primary-foreground/70">Students</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">900+</div>
              <div className="text-sm text-primary-foreground/70">Teachers</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <Card className="shadow-strong border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-poppins">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="rememberMe">Remember me</Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
