import { useState } from 'react'
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

// ─── Layout constants ─────────────────────────────────────────────────────────
// The board is a fixed virtual canvas. Every wreath position is in px.
// Rings are full 360° circles; spacing is computed to guarantee no overlap.
//
// Wreath rendered size: 64 × 64 px icon + ~18 px label area below.
// Minimum centre-to-centre distance needed: 72 px (icon width + 8 px gap).
//
// For each ring radius R and count N:
//   chord between adjacent centres = 2R·sin(π/N)  ≥  72
//
// Ring 1  R=170 N=6   chord=170  ✓
// Ring 2  R=280 N=10  chord=173  ✓
// Ring 3  R=390 N=14  chord=173  ✓
// Ring 4  R=500 N=18  chord=173  ✓

const CX = 520          // tombstone centre-X
const CY = 440          // tombstone base-Y (where rings origin sits)
const CANVAS_W = 1040
const CANVAS_H = 960

const TOMBSTONE_W = 210
const TOMBSTONE_H = 300
// Stone SVG: plinth base at y=228 of 260 → 87.7 % from top
const STONE_BASE_FRAC = 228 / 260
const TOMBSTONE_LEFT = CX - TOMBSTONE_W / 2
const TOMBSTONE_TOP  = CY - TOMBSTONE_H * STONE_BASE_FRAC

const RINGS = [
  { radius: 170, count: 6,  startDeg: 0  },
  { radius: 280, count: 10, startDeg: 18 },
  { radius: 390, count: 14, startDeg: 12 },
  { radius: 500, count: 18, startDeg:  6 },
]

function getWreathXY(index: number): { x: number; y: number } {
  let total = 0
  for (const ring of RINGS) {
    if (index < total + ring.count) {
      const i = index - total
      const deg = ring.startDeg + (i / ring.count) * 360
      const rad = (deg * Math.PI) / 180
      return { x: CX + ring.radius * Math.cos(rad), y: CY + ring.radius * Math.sin(rad) }
    }
    total += ring.count
  }
  // Overflow: spiral outward
  const i = index - total
  const deg = (i / 20) * 360
  const rad = (deg * Math.PI) / 180
  return { x: CX + 610 * Math.cos(rad), y: CY + 610 * Math.sin(rad) }
}

// ─── Tombstone ────────────────────────────────────────────────────────────────

function Tombstone({ firstName, surname, otherNames, dateOfBirth, dateOfDeath }: {
  firstName: string; surname: string; otherNames: string | null
  dateOfBirth: string | null; dateOfDeath: string
}) {
  const parts = [firstName, otherNames, surname].filter(Boolean).join(' ').split(' ')
  const line1 = parts.slice(0, 2).join(' ')
  const line2 = parts.slice(2).join(' ')
  const birthY = dateOfBirth ? new Date(dateOfBirth).getFullYear() : null
  const deathY = new Date(dateOfDeath).getFullYear()
  const dates  = birthY ? `${birthY} — ${deathY}` : String(deathY)
  const nameY  = line2 ? 175 : 160

  return (
    <svg viewBox="0 0 180 260" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))' }}>
      <ellipse cx="90" cy="252" rx="78" ry="7" fill="rgba(0,0,0,0.55)" />
      <rect x="5"  y="228" width="170" height="25" rx="4" fill="#383838" />
      <rect x="10" y="232" width="160" height="17" rx="3" fill="#424242" />
      <rect x="22" y="85"  width="136" height="150" rx="6" fill="#505050" />
      <path d="M22,105 Q22,28 90,28 Q158,28 158,105 Z" fill="#505050" />
      <path d="M22,105 Q22,28 90,28" fill="none" stroke="#686868" strokeWidth="1.5" opacity="0.5" />
      <rect x="82" y="16" width="16" height="54" rx="4" fill="#3a3a3a" />
      <rect x="64" y="31" width="52" height="14" rx="4" fill="#3a3a3a" />
      <rect x="83" y="17" width="3"  height="52" rx="2" fill="#585858" opacity="0.5" />
      <rect x="32" y="100" width="116" height="120" rx="5" fill="#484848" />
      <text x="90" y="122" textAnchor="middle" fill="#c8a070" fontFamily="Georgia,'Times New Roman',serif" fontSize="13" fontStyle="italic" fontWeight="bold">R . I . P .</text>
      <line x1="42" y1="129" x2="138" y2="129" stroke="#8a7060" strokeWidth="0.7" opacity="0.55" />
      <text x="90" y="149" textAnchor="middle" fill="#ddd0b4" fontFamily="Georgia,'Times New Roman',serif" fontSize="10.5" fontWeight="bold" letterSpacing="0.5">{line1.toUpperCase()}</text>
      {line2 && <text x="90" y="165" textAnchor="middle" fill="#ddd0b4" fontFamily="Georgia,'Times New Roman',serif" fontSize="10.5" fontWeight="bold" letterSpacing="0.5">{line2.toUpperCase()}</text>}
      <line x1="42" y1={nameY} x2="138" y2={nameY} stroke="#8a7060" strokeWidth="0.7" opacity="0.55" />
      <text x="90" y={nameY + 17} textAnchor="middle" fill="#b09880" fontFamily="Georgia,'Times New Roman',serif" fontSize="9">{dates}</text>
      <text x="90" y={nameY + 33} textAnchor="middle" fill="#7a6858" fontFamily="Georgia,serif" fontSize="8" opacity="0.7">✦  ✦  ✦</text>
    </svg>
  )
}

// ─── Placed wreath with price tag ─────────────────────────────────────────────

function PlacedWreath({ placement, x, y }: { placement: WreathPlacement; x: number; y: number }) {
  const config  = getWreathType(placement.wreath_type)
  const name    = placement.profiles?.display_name ?? placement.profiles?.username ?? placement.guest_name ?? 'Visitor'
  const isBehind = y < CY   // wreaths above ring origin appear "behind" stone
  const zIndex   = isBehind ? 4 : 16

  return (
    <div
      title={`${name} — GH₵ ${config.price}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        zIndex,
        opacity: isBehind ? 0.7 : 1,
        transition: 'transform 0.2s, opacity 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translate(-50%,-50%) scale(1.12)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translate(-50%,-50%) scale(1)' }}
    >
      {/* Wreath */}
      <div style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))' }}>
        <WreathIcon config={config} size={64} />
      </div>

      {/* Price tag */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f0e0 0%, #ede8c0 100%)',
        border: '1px solid #c8a030',
        borderRadius: 4,
        padding: '1px 7px',
        fontSize: 9,
        color: '#3a2810',
        fontWeight: 700,
        fontFamily: '"Courier New", Courier, monospace',
        letterSpacing: 0.3,
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
        position: 'relative',
      }}>
        {/* Tag string */}
        <span style={{
          position: 'absolute',
          top: -5, left: '50%',
          transform: 'translateX(-50%)',
          width: 1,
          height: 5,
          background: '#c8a030',
          display: 'block',
        }} />
        GH₵ {config.price}
      </div>

      {/* Placer name */}
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'rgba(225,205,155,0.92)',
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        maxWidth: 72,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}>
        {name}
      </div>
    </div>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: ((i * 137.508) % 100),
  y: ((i *  97.344) % 55),
  r: i % 7 === 0 ? 0.8 : i % 3 === 0 ? 0.5 : 0.3,
  op: 0.25 + (i % 8) * 0.07,
}))

// ─── Lay-wreath modal ─────────────────────────────────────────────────────────

function LayWreathModal({ onClose, onPlace, isPending, isGuest }: {
  onClose: () => void
  onPlace: (type: string, guestName?: string) => void
  isPending: boolean
  isGuest: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')

  function submit() {
    if (!selected) return
    if (isGuest && !guestName.trim()) return
    onPlace(selected, isGuest ? guestName.trim() : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.94)' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <h2 className="text-white text-xl font-semibold">Choose a Wreath</h2>
          <p className="text-white/45 text-sm mt-0.5">Select a wreath or flowers to lay in remembrance</p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {WREATH_TYPES.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelected(w.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-left ${
                selected === w.id
                  ? 'bg-white/15 ring-2 ring-white/40 scale-105'
                  : 'hover:bg-white/8'
              }`}
            >
              <WreathIcon config={w} size={72} />
              <p className="text-white/85 text-xs font-semibold text-center leading-tight">{w.name}</p>
              {/* Price tag in modal */}
              <span style={{
                background: 'linear-gradient(135deg,#f5f0e0,#ede8c0)',
                border: '1px solid #c8a030',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 9,
                color: '#3a2810',
                fontWeight: 700,
                fontFamily: '"Courier New",monospace',
              }}>
                GH₵ {w.price}
              </span>
              <p className="text-white/35 text-[10px] text-center leading-tight hidden md:block">{w.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/10 space-y-3 flex-shrink-0">
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
            onClick={submit}
            className="gap-2"
            style={{ background: 'linear-gradient(135deg,#1a5c1a,#2a8c2a)', color: 'white' }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flower2 className="h-4 w-4" />}
            Lay Wreath{selected ? ` — GH₵ ${getWreathType(selected).price}` : ''}
          </Button>
        </div>
      </div>
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050a05' }}>
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  )

  if (!announcement?.wreath_board_enabled) return <Navigate to={`/announcement/${slug}`} replace />

  async function handlePlace(wreathType: string, guestName?: string) {
    try {
      await placeWreath({ wreathType, guestName })
      setShowModal(false)
      toast({ title: 'Wreath laid', description: 'Your wreath has been placed at the memorial.' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not lay wreath', description: (err as Error).message })
    }
  }

  const fullName = [announcement.first_name, announcement.other_names, announcement.surname].filter(Boolean).join(' ')

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg,#040904 0%,#060d06 45%,#080f06 70%,#050c04 100%)' }}
    >
      {/* ── Stars ── */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 w-full"
        style={{ height: '60%', zIndex: 0 }}
      >
        {STARS.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op} />
        ))}
      </svg>

      {/* ── Moon ── */}
      <div aria-hidden className="pointer-events-none fixed" style={{
        top: '4%', right: '7%', width: 52, height: 52, zIndex: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 33% 33%,#f5e8c0,#d4b870)',
        boxShadow: '0 0 36px 10px rgba(212,184,112,0.13)',
      }} />

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
        style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.65),transparent)' }}
      >
        <Link
          to={`/announcement/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="text-center">
          <p className="text-white/40 text-[10px] tracking-widest uppercase">Wreath Memorial</p>
          <p className="text-white/80 text-sm font-medium">{fullName}</p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="gap-1.5 text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg,#1a5c1a,#2a8c2a)',
            border: '1px solid rgba(80,180,80,0.3)',
            color: 'white',
          }}
        >
          <Flower2 className="h-4 w-4" />
          Lay a Wreath
        </Button>
      </div>

      {/* ── Scrollable board ── */}
      <div className="flex-1 overflow-auto z-10 relative" style={{ minHeight: 0 }}>
        {/* Inner fixed canvas — horizontally centred, scrollable on small screens */}
        <div
          style={{
            position: 'relative',
            width: CANVAS_W,
            height: CANVAS_H,
            margin: '0 auto',
          }}
        >
          {/* Ground at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
            background: 'linear-gradient(180deg,transparent,rgba(4,14,4,0.9))',
            pointerEvents: 'none',
          }} />

          {/* Tombstone — z-index 10 so "front" wreaths render above, "back" wreaths below */}
          <div style={{
            position: 'absolute',
            left: TOMBSTONE_LEFT,
            top: TOMBSTONE_TOP,
            width: TOMBSTONE_W,
            height: TOMBSTONE_H,
            zIndex: 10,
          }}>
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
            const { x, y } = getWreathXY(index)
            return (
              <PlacedWreath key={placement.id} placement={placement} x={x} y={y} />
            )
          })}

          {/* Empty state */}
          {placements.length === 0 && (
            <div style={{
              position: 'absolute',
              left: '50%', top: CY + 240,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              width: 280,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 13 }}>No wreaths have been laid yet.</p>
              <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: 11, marginTop: 4 }}>Be the first to lay a wreath in remembrance.</p>
            </div>
          )}

          {/* Wreath count */}
          {placements.length > 0 && (
            <div style={{
              position: 'absolute',
              left: '50%', bottom: 18,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 20,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, whiteSpace: 'nowrap' }}>
                {placements.length} wreath{placements.length !== 1 ? 's' : ''} laid in remembrance
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
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
