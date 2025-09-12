import { CheckCircle, Clock, Mail, School, User, UserCheck, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { teacherInvitationService } from "@/services/teacher-invitation.service";
import {
  AcceptInvitationRequest,
  DeclineInvitationRequest,
  TeacherInvitation,
} from "@/types/teacher-invitation";

export default function TeacherInvitationAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<TeacherInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"view" | "accept" | "decline">("view");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [acceptData, setAcceptData] = useState<AcceptInvitationRequest>({
    token: token || "",
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
  });

  const [declineData, setDeclineData] = useState<DeclineInvitationRequest>({
    token: token || "",
    reason: "",
  });

  // Load invitation details
  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const invitationData = await teacherInvitationService.getInvitationByToken(token);
        setInvitation(invitationData);

        // Pre-fill form with invitation data
        setAcceptData((prev) => ({
          ...prev,
          firstName: invitationData.firstName || "",
          lastName: invitationData.lastName || "",
        }));
      } catch (err) {
        setError("Failed to load invitation details");
        console.error("Error loading invitation:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  // Handle accept invitation
  const handleAcceptInvitation = async () => {
    if (!acceptData.firstName || !acceptData.lastName || !acceptData.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await teacherInvitationService.acceptInvitation(acceptData);
      setSuccess(true);
      setAction("accept");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle decline invitation
  const handleDeclineInvitation = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await teacherInvitationService.declineInvitation(declineData);
      setSuccess(true);
      setAction("decline");
    } catch (err: any) {
      setError(err.message || "Failed to decline invitation");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if invitation is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if accept form is valid
  const isAcceptFormValid = acceptData.firstName && acceptData.lastName && acceptData.password;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">
              {action === "accept" ? "Invitation Accepted!" : "Invitation Declined"}
            </CardTitle>
            <CardDescription>
              {action === "accept"
                ? "Your account has been created successfully. You will be redirected to login shortly."
                : "Thank you for your response. The invitation has been declined."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {action === "accept" && (
              <p className="text-sm text-gray-600 mb-4">Redirecting to login in 3 seconds...</p>
            )}
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const expired = isExpired(invitation.expiresAt);
  const daysLeft = getDaysUntilExpiry(invitation.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <School className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Teacher Invitation</CardTitle>
            <CardDescription>
              You have been invited to join {invitation.school?.name || "our school"} as a teacher
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{invitation.email}</span>
              </div>

              {invitation.inviter && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Invited by:</span>
                  <span>
                    {invitation.inviter.firstName} {invitation.inviter.lastName}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Expires:</span>
                <span>{formatDate(invitation.expiresAt)}</span>
                {!expired && (
                  <Badge variant="outline" className="ml-2">
                    {daysLeft} days left
                  </Badge>
                )}
              </div>
            </div>

            {/* Personal Message */}
            {invitation.message && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Personal Message</h4>
                <p className="text-blue-800 text-sm">{invitation.message}</p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Expired Invitation */}
            {expired && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  This invitation has expired. Please contact the school administrator for a new
                  invitation.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {!expired && invitation.status === "pending" && (
              <div className="space-y-4">
                {action === "view" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setAction("accept")}
                      className="flex-1"
                      disabled={submitting}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </Button>
                    <Button
                      onClick={() => setAction("decline")}
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}

                {/* Accept Form */}
                {action === "accept" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Complete Your Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={acceptData.firstName}
                          onChange={(e) =>
                            setAcceptData({ ...acceptData, firstName: e.target.value })
                          }
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={acceptData.lastName}
                          onChange={(e) =>
                            setAcceptData({ ...acceptData, lastName: e.target.value })
                          }
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={acceptData.password}
                        onChange={(e) => setAcceptData({ ...acceptData, password: e.target.value })}
                        placeholder="Create a secure password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={acceptData.phone}
                        onChange={(e) => setAcceptData({ ...acceptData, phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAcceptInvitation}
                        disabled={submitting || !isAcceptFormValid}
                        className="flex-1"
                      >
                        {submitting ? "Creating Account..." : "Accept & Create Account"}
                      </Button>
                      <Button
                        onClick={() => setAction("view")}
                        variant="outline"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Decline Form */}
                {action === "decline" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Decline Invitation</h3>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Textarea
                        id="reason"
                        value={declineData.reason}
                        onChange={(e) => setDeclineData({ ...declineData, reason: e.target.value })}
                        placeholder="Please let us know why you're declining this invitation..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleDeclineInvitation}
                        variant="destructive"
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? "Declining..." : "Submit Decline"}
                      </Button>
                      <Button
                        onClick={() => setAction("view")}
                        variant="outline"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Already Processed */}
            {invitation.status !== "pending" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {invitation.status === "accepted" ? (
                    <UserCheck className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {invitation.status === "accepted"
                      ? "Invitation Accepted"
                      : "Invitation Declined"}
                  </h3>
                  <p className="text-gray-600">
                    This invitation has already been {invitation.status}.
                  </p>
                </div>
                <Button onClick={() => navigate("/")} variant="outline">
                  Go Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
