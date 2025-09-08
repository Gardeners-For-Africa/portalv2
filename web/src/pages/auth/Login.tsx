import { AlertCircle, Building, GraduationCap, Lock, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const DEMO_ACCOUNTS = [
  { email: "admin@campusbloom.com", role: "Super Admin", password: "admin123" },
  { email: "principal@greenvalley.edu", role: "School Admin", password: "principal123" },
  { email: "john.smith@greenvalley.edu", role: "Teacher", password: "teacher123" },
  { email: "emma.wilson@student.greenvalley.edu", role: "Student", password: "student123" },
  { email: "david.wilson@parent.greenvalley.edu", role: "Parent", password: "parent123" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
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

    const success = await login(email, password, tenantSlug);
    if (success) {
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (!demoEmail.includes("admin@campusbloom.com")) {
      setTenantSlug("green-valley");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540151812223-c30b3fab58e6')] bg-cover bg-center"></div>

      {/* Transparent green overlay */}
      <div className="absolute inset-0 bg-green-900/70"></div>
      <div className="w-full relative max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left text-primary-foreground space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-poppins font-bold">Gardeners for Africa</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-poppins font-semibold">
              Welcome to the Future of Education Management
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Streamline your school operations with our comprehensive management system. Connect
              students, teachers, parents, and administrators in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
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

                <div className="space-y-2">
                  <Label htmlFor="tenant">School (Optional for Super Admin)</Label>
                  <Select value={tenantSlug} onValueChange={setTenantSlug}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select your school" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green-valley">Green Valley School</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Demo Accounts */}
          <Card className="shadow-medium border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Demo Accounts</CardTitle>
              <CardDescription>Click any account below to auto-fill credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{account.email}</span>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {account.role}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    Try
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
