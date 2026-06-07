import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { FMIcon } from '@/components/ui/FMLogo'

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <FMIcon size={36} />
              <div>
                <p
                  className="font-bold text-base text-[#1c2f6b] dark:text-white leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                >
                  Funeral Matters
                </p>
                <p className="text-[10px] text-muted-foreground tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Honouring Lives. Preserving Memories.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              A dignified platform for honouring lives and preserving memories of those who have passed.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/announcements" className="hover:text-foreground transition-colors">Announcements</Link></li>
              <li><Link to="/search" className="hover:text-foreground transition-colors">Search</Link></li>
              <li><Link to="/auth/register" className="hover:text-foreground transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Centre</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Funeral Matters. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> in remembrance
          </p>
        </div>
      </div>
    </footer>
  )
}
