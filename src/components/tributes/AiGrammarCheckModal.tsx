import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { aiService } from '@/services/aiService'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface Props {
  text: string
  onUseImproved: (improved: string) => void
}

type State = 'idle' | 'checking' | 'result' | 'error'

export default function AiGrammarCheckModal({ text, onUseImproved }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [improved, setImproved] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleCheck() {
    if (!text.trim()) {
      toast({ variant: 'destructive', title: 'Nothing to check', description: 'Write your message first.' })
      return
    }
    setOpen(true)
    setState('checking')
    try {
      const result = await aiService.checkGrammar(text)
      setImproved(result.improved)
      setState('result')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setState('error')
    }
  }

  function handleUseImproved() {
    onUseImproved(improved)
    setOpen(false)
    setState('idle')
  }

  function handleUseOriginal() {
    setOpen(false)
    setState('idle')
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/30"
        onClick={handleCheck}
      >
        <Sparkles className="h-4 w-4" />
        AI Grammar &amp; Spell Check
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) setState('idle'); setOpen(v) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Grammar &amp; Spell Check
            </DialogTitle>
            <DialogDescription>
              Review the AI-improved version before deciding which to use.
            </DialogDescription>
          </DialogHeader>

          {state === 'checking' && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <span>Reviewing your message…</span>
            </div>
          )}

          {state === 'result' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Original</p>
                <div className="rounded-lg border bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {text}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-2">AI Improved</p>
                <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {improved}
                </div>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMsg || 'An error occurred. Please try again.'}
            </div>
          )}

          <DialogFooter className="gap-2">
            {state === 'result' && (
              <>
                <Button variant="outline" onClick={handleUseOriginal}>Use Original</Button>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleUseImproved} className="gap-2">
                  <Sparkles className="h-4 w-4" /> Use AI Version
                </Button>
              </>
            )}
            {state === 'error' && (
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
