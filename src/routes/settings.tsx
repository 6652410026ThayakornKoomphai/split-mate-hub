import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SplitMate" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input defaultValue="Alex" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="alex@splitmate.app" className="h-11" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
        <h2 className="font-semibold text-lg">Preferences</h2>
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Default currency</Label>
            <Select defaultValue="THB">
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THB">฿ Thai Baht (THB)</SelectItem>
                <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                <SelectItem value="JPY">¥ Japanese Yen (JPY)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select defaultValue="light">
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>
    </div>
  );
}
