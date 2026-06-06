import { useState } from 'react'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface Props {
  url: string
  title: string
}

export default function ShareMenu({ url, title }: Props) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const platforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: '📘',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      icon: '🐦',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Link copied', description: 'The announcement link has been copied.' })
    } catch {
      toast({ variant: 'destructive', title: 'Failed to copy' })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {platforms.map((p) => (
          <DropdownMenuItem key={p.name} asChild>
            <a href={p.href} target="_blank" rel="noopener noreferrer" className="gap-2 cursor-pointer">
              <span>{p.icon}</span> {p.name}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
