import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  if (!token) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <KeyRound className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
              <p className="text-muted-foreground mb-4">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button onClick={() => navigate("/captain-login")} data-testid="button-back-to-login">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-bold mb-2" data-testid="text-reset-success">Password Reset Successful</h2>
              <p className="text-muted-foreground mb-4">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Button onClick={() => navigate("/captain-login")} data-testid="button-go-to-login">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast({ title: "Please enter and confirm your new password", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      setSuccess(true);
    } catch (err) {
      toast({ title: "Reset Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-secondary text-stone-900 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-display uppercase" data-testid="text-reset-password-title">Reset Password</h1>
          <p className="opacity-80">Set a new password for your account</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Enter your email and choose a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-testid="input-reset-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  data-testid="input-confirm-password"
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive" data-testid="text-password-mismatch">
                  Passwords do not match
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                data-testid="button-reset-password"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
