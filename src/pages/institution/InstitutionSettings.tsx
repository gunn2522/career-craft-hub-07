import { useState } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Bell, Shield, User } from "lucide-react";

const InstitutionSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    newMemberAlerts: true,
    weeklyDigest: false,
  });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  return (
    <InstitutionLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Contact support to change your email</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your institution</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified before your events</p>
              </div>
              <Switch
                checked={settings.eventReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, eventReminders: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>New Member Alerts</Label>
                <p className="text-sm text-muted-foreground">Be notified when new members join</p>
              </div>
              <Switch
                checked={settings.newMemberAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, newMemberAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of activities</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <p className="text-sm text-muted-foreground">
              We recommend using a strong, unique password
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Settings className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionSettings;
