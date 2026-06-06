import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type ForgotForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: ForgotForm) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <Link to="/auth/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              {sent
                ? 'Check your inbox for a reset link.'
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          {!sent && (
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
