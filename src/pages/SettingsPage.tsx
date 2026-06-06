import { useTheme } from '@/contexts/ThemeContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { toast } = useToast()
  const [emailNotifs, setEmailNotifs] = useState(true)

  async function handleEmailNotifToggle(checked: boolean) {
    setEmailNotifs(checked)
    const { error } = await supabase
      .from('user_preferences')
      .update({ email_notifications: checked })
      .eq('user_id', user!.id)
    if (error) {
      toast({ variant: 'destructive', title: 'Error saving preference' })
      setEmailNotifs(!checked)
    } else {
      toast({ title: checked ? 'Email notifications enabled' : 'Email notifications disabled' })
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customise how the application looks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Choose light, dark, or system default.</p>
              </div>
              <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Control how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates for new tributes and activity.</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={handleEmailNotifToggle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Email address</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
              </div>
              <button
                className="text-xs text-destructive underline hover:no-underline"
                onClick={() => toast({ variant: 'destructive', title: 'Contact support to delete your account.' })}
              >
                Request deletion
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
