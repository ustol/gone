import { useState, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Flower2, Loader2, X } from 'lucide-react'
import { useAnnouncement } from '@/hooks/use-announcements'
import { useWreathPlacements, usePlaceWreath } from '@/hooks/use-wreaths'
import { useAuth } from '@/contexts/AuthContext'
import { WREATH_TYPES, getWreathType } from '@/lib/wreathTypes'
import WreathIcon from '@/components/wreaths/WreathIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { WreathPlacement } from '@/types/database'

// ─── Tombstone ───────────────────────────────────────────────────────────────

function Tombstone({ firstName, surname, otherNames, dateOfBirth, dateOfDeath }: {
  firstName: string
  surname: string
  otherNames: string | null
  dateOfBirth: string | null
  dateOfDeath: string
}) {
  const fullName = [firstName, otherNames, surname].filter(Boolean).join(' ')
  const nameParts = fullName.split(' ')
  const line1 = nameParts.slice(0, 2).join(' ')
  const line2 = nameParts.slice(2).join(' ')
  const birthYear = dateOfBirth ? new Date(dateOfBirth).getFullYear() : null
  const deathYear = new Date(dateOfDeath).getFullYear()
  const dates = birthYear ? `${birthYear} — ${deathYear}` : `${deathYear}`

  return (
    <svg viewBox="0 0 180 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      {/* Shadow under stone */}
      <ellipse cx="90" cy="252" rx="75" ry="6" fill="rgba(0,0,0,0.5)" />

      {/* Plinth/base */}
      <rect x="5" y="228" width="170" height="24" rx="4" fill="#3a3a3a" />
      <rect x="10" y="232" width="160" height="16" rx="3" fill="#444" />

      {/* Main body */}
      <rect x="22" y="85" width="136" height="150" rx="6" fill="#525252" />

      {/* Arch top */}
      <path d="M22,105 Q22,30 90,30 Q158,30 158,105 Z" fill="#525252" />

      {/* Stone highlight (left edge) */}
      <path d="M22,105 Q22,30 90,30" fill="none" stroke="#6a6a6a" strokeWidth="2" opacity="0.5" />

      {/* Cross */}
      <rect x="82" y="18" width="16" height="52" rx="4" fill="#3c3c3c" />
      <rect x="64" y="33" width="52" height="14" rx="4" fill="#3c3c3c" />
      {/* Cross highlight */}
      <rect x="83" y="19" width="3" height="50" rx="2" fill="#5a5a5a" opacity="0.5" />

      {/* Engraved panel */}
      <rect x="32" y="100" width="116" height="120" rx="5" fill="#4a4a4a" />

      {/* RIP */}
      <text x="90" y="123" textAnchor="middle" fill="#c8a878" fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" fontStyle="italic" fontWeight="bold">
        R . I . P .
      </text>

      {/* Decorative line */}
      <line x1="42" y1="130" x2="138" y2="130" stroke="#8a7a6a" strokeWidth="0.8" opacity="0.6" />

      {/* Name lines */}
      <text x="90" y="150" textAnchor="middle" fill="#ddd0b8" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fontWeight="bold" letterSpacing="0.5">
        {line1.toUpperCase()}
      </text>
      {line2 && (
        <text x="90" y="166" textAnchor="middle" fill="#ddd0b8" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fontWeight="bold" letterSpacing="0.5">
          {line2.toUpperCase()}
        </text>
      )}

      {/* Decorative line */}
      <line x1="42" y1={line2 ? 175 : 160} x2="138" y2={line2 ? 175 : 160} stroke="#8a7a6a" strokeWidth="0.8" opacity="0.6" />

      {/* Dates */}
      <text x="90" y={line2 ? 193 : 178} textAnchor="middle" fill="#b0a090" fontFamily="Georgia, 'Times New Roman', serif" fontSize="9.5">
        {dates}
      </text>

      {/* Small star decoration */}
      <text x="90" y={line2 ? 211 : 196} textAnchor="middle" fill="#8a7a6a" fontFamily="Georgia, serif" fontSize="9" opacity="0.7">
        ✦  ✦  ✦
      </text>
    </svg>
  )
}

// ─── Wreath position calculation ─────────────────────────────────────────────

function getWreathPosition(index: number): { x: number; y: number } {
  // Rings: each ring holds a set number, placed in a fan below the tombstone
  // cx=50%, cy=44% (tombstone center)
  const rings = [
    { capacity: 5, radius: 21, startDeg: 50, endDeg: 130 },
    { capacity: 9, radius: 35, startDeg: 30, endDeg: 150 },
    { capacity: 13, radius: 49, startDeg: 20, endDeg: 160 },
    { capacity: 15, radius: 62, startDeg: 10, endDeg: 170 },
  ]

  let ring = 0
  let indexInRing = index
  for (let r = 0; r < rings.length; r++) {
    if (indexInRing < rings[r].capacity) { ring = r; break }
    indexInRing -= rings[r].capacity
    ring = r + 1
  }

  const { capacity, radius, startDeg, endDeg } = rings[Math.min(ring, rings.length - 1)]
  const count = Math.min(capacity, indexInRing + 1)
  const deg = count <= 1
    ? (startDeg + endDeg) / 2
    : startDeg + (indexInRing / (capacity - 1)) * (endDeg - startDeg)
  const rad = (deg * Math.PI) / 180

  const x = 50 + radius * Math.cos(rad)
  const y = 44 + radius * Math.sin(rad)

  return { x, y }
}

// ─── Stars background ─────────────────────────────────────────────────────────

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (((i * 137.5) % 1) * 100 + i * 1.7) % 100,
  y: (((i * 97.3) % 1) * 60 + i * 0.9) % 60,
  r: i % 5 === 0 ? 0.7 : i % 3 === 0 ? 0.5 : 0.3,
  opacity: 0.3 + (i % 7) * 0.1,
}))

// ─── Wreath selection modal ───────────────────────────────────────────────────

function LayWreathModal({ onClose, onPlace, isPending, isGuest }: {
  onClose: () => void
  onPlace: (wreathType: string, guestName?: string) => void
  isPending: boolean
  isGuest: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')

  function handleSubmit() {
    if (!selected) return
    if (isGuest && !guestName.trim()) return
    onPlace(selected, isGuest ? guestName.trim() : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-white text-xl font-semibold">Choose a Wreath</h2>
          <p className="text-white/50 text-sm mt-0.5">Select a wreath to lay in remembrance</p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Wreath grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {WREATH_TYPES.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelected(w.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                selected === w.id
                  ? 'bg-white/15 ring-2 ring-white/40 scale-105'
                  : 'hover:bg-white/8 hover:scale-102'
              }`}
            >
              <WreathIcon config={w} size={72} />
              <span className="text-white/80 text-xs text-center leading-tight font-medium">{w.name}</span>
              <span className="text-white/40 text-[10px] text-center leading-tight hidden sm:block">{w.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 space-y-3">
        {isGuest && (
          <div className="flex items-center gap-3 max-w-sm">
            <Label htmlFor="guest-name" className="text-white/70 text-sm whitespace-nowrap">Your name</Label>
            <Input
              id="guest-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Kofi Mensah"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-9"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="border-white/20 text-white/70 hover:bg-white/10">
            Cancel
          </Button>
          <Button
            disabled={!selected || isPending || (isGuest && !guestName.trim())}
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-600 text-white gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flower2 className="h-4 w-4" />}
            Lay Wreath
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Placed wreath item ───────────────────────────────────────────────────────

function PlacedWreath({ placement, style }: { placement: WreathPlacement; style: React.CSSProperties }) {
  const config = getWreathType(placement.wreath_type)
  const name = placement.profiles?.display_name ?? placement.profiles?.username ?? placement.guest_name ?? 'Visitor'

  return (
    <div
      className="absolute flex flex-col items-center gap-0.5"
      style={{ transform: 'translate(-50%, -50%)', ...style }}
    >
      <div className="drop-shadow-lg hover:scale-110 transition-transform duration-200 cursor-default">
        <WreathIcon config={config} size={64} />
      </div>
      <span
        className="text-[9px] font-medium text-center leading-tight max-w-[70px] truncate"
        style={{ color: 'rgba(220,200,160,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        {name}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WreathBoardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: announcement, isLoading } = useAnnouncement(slug!)
  const { data: placements = [] } = useWreathPlacements(announcement?.id ?? '')
  const { mutateAsync: placeWreath, isPending } = usePlaceWreath(announcement?.id ?? '')
  const [showModal, setShowModal] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050a05' }}>
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!announcement || !announcement.wreath_board_enabled) {
    return <Navigate to={`/announcement/${slug}`} replace />
  }

  async function handlePlace(wreathType: string, guestName?: string) {
    try {
      await placeWreath({ wreathType, guestName })
      setShowModal(false)
      toast({ title: 'Wreath laid', description: 'Your wreath has been placed at the memorial.' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not place wreath', description: (err as Error).message })
    }
  }

  const fullName = [announcement.first_name, announcement.other_names, announcement.surname].filter(Boolean).join(' ')

  return (
    <div
      className="min-h-screen relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #050a05 0%, #080d04 40%, #0a1208 70%, #061006 100%)' }}
    >
      {/* ── Stars ── */}
      <svg className="absolute inset-0 w-full pointer-events-none" style={{ height: '65%' }}>
        {STARS.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </svg>

      {/* ── Moon ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '4%', right: '8%',
          width: 48, height: 48,
          background: 'radial-gradient(circle at 35% 35%, #f5e8c0, #d4b870)',
          boxShadow: '0 0 30px 8px rgba(212,184,112,0.15)',
        }}
      />

      {/* ── Ground gradient ── */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: '30%',
          background: 'linear-gradient(180deg, transparent 0%, #040e04 40%, #030a03 100%)',
        }}
      />

      {/* ── Grass line ── */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: 3,
          background: 'linear-gradient(90deg, #0d2a0d, #1a4a1a, #0d2a0d)',
          opacity: 0.6,
        }}
      />

      {/* ── Mist/fog ── */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: '22%',
          background: 'linear-gradient(180deg, transparent, rgba(15,25,15,0.4))',
        }}
      />

      {/* ── Top bar ── */}
      <div
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)' }}
      >
        <Link
          to={`/announcement/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="text-center">
          <p className="text-white/50 text-xs">Wreath Memorial</p>
          <p className="text-white/80 text-sm font-medium leading-tight">{fullName}</p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, #1a5c1a, #2a8c2a)',
            border: '1px solid rgba(80,180,80,0.3)',
            color: 'white',
          }}
        >
          <Flower2 className="h-4 w-4" />
          Lay a Wreath
        </Button>
      </div>

      {/* ── Board ── */}
      <div
        ref={boardRef}
        className="relative w-full"
        style={{ minHeight: '100svh' }}
      >
        {/* Tombstone */}
        <div
          className="absolute"
          style={{ left: '50%', top: '18%', transform: 'translateX(-50%)', width: 'min(160px, 22vw)' }}
        >
          <Tombstone
            firstName={announcement.first_name}
            surname={announcement.surname}
            otherNames={announcement.other_names}
            dateOfBirth={announcement.date_of_birth}
            dateOfDeath={announcement.date_of_death}
          />
        </div>

        {/* Placed wreaths */}
        {placements.map((placement, index) => {
          const pos = getWreathPosition(index)
          return (
            <PlacedWreath
              key={placement.id}
              placement={placement}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            />
          )
        })}

        {/* Empty state */}
        {placements.length === 0 && (
          <div
            className="absolute text-center"
            style={{ left: '50%', top: '78%', transform: 'translateX(-50%)', width: 280 }}
          >
            <p className="text-white/30 text-sm">No wreaths have been laid yet.</p>
            <p className="text-white/20 text-xs mt-1">Be the first to lay a wreath in remembrance.</p>
          </div>
        )}

        {/* Wreath count */}
        {placements.length > 0 && (
          <div
            className="absolute"
            style={{ left: '50%', top: '92%', transform: 'translateX(-50%)' }}
          >
            <p className="text-white/25 text-xs text-center">
              {placements.length} wreath{placements.length !== 1 ? 's' : ''} laid in remembrance
            </p>
          </div>
        )}
      </div>

      {/* ── Lay wreath modal ── */}
      {showModal && (
        <LayWreathModal
          onClose={() => setShowModal(false)}
          onPlace={handlePlace}
          isPending={isPending}
          isGuest={!user}
        />
      )}
    </div>
  )
}
