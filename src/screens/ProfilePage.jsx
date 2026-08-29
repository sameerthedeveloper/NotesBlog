"use client";

import { useState } from "react";
import { Badge as BadgeIcon, Mail, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createUserProfile } from "@/features/notes/services/notesService";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfilePage = () => {
  const { currentUser } = useAuth();

  const [name, setName] = useState(currentUser?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserProfile(currentUser.uid, { name });
      toast.success("Settings updated!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-1 font-medium text-muted-foreground">
          Customize your workspace and personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-primary/2 p-6 text-center">
          <Avatar className="mb-4 size-32 text-4xl font-extrabold">
            <AvatarImage src={currentUser?.photoURL || undefined} />
            <AvatarFallback className="bg-muted text-foreground">
              {currentUser?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-extrabold tracking-tight">{currentUser?.displayName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{currentUser?.email}</p>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="mb-1 text-lg font-extrabold">Account Details</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Update how your name appears in shared notes and notifications.
            </p>

            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-name">Workspace Name</Label>
                <div className="relative">
                  <BadgeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-email">Member Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input id="profile-email" value={currentUser?.email || ""} disabled className="pl-9" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Save />}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/2 p-6">
            <h2 className="mb-1 text-lg font-extrabold text-destructive">Deactivate Space</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently delete your member account and all of your personal notes.
            </p>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">
              Delete Forever
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
