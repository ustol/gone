import { Link } from 'react-router-dom'
import { Heart, Shield, Sparkles, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAnnouncements } from '@/hooks/use-announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const { data, isLoading } = useAnnouncements(1)

  const features = [
    {
      icon: Heart,
      title: 'Heartfelt Memorials',
      description: 'Create beautiful announcements that honour the lives of those who have passed.',
    },
    {
      icon: Sparkles,
      title: 'AI-Assisted Tributes',
      description: 'Our AI helps craft respectful, well-written tributes while preserving your personal voice.',
    },
    {
      icon: Shield,
      title: 'Moderation Controls',
      description: 'Manage tributes with confidence. Auto-approve or review each one before it goes public.',
    },
    {
      icon: Globe,
      title: 'Easy Sharing',
      description: 'Share memorial announcements on WhatsApp, Facebook, X, LinkedIn, and more.',
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-[hsl(224,30%,97%)] to-white dark:from-[hsl(224,45%,8%)] dark:via-[hsl(224,38%,11%)] dark:to-[hsl(224,30%,9%)] py-24 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 dark:opacity-10" />
        <div className="container max-w-3xl text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 dark:bg-white/5 px-4 py-1.5 text-sm text-muted-foreground mb-8 shadow-sm">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            Honouring lives, preserving memories
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            A dignified space to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a07010 0%, #c8a040 30%, #e8cc78 55%, #c8a040 80%, #a07010 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>remember</span>{' '}
            and honour loved ones
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Funeral Matters helps you create meaningful memorial announcements, collect heartfelt tributes, and share remembrance with family and friends across the globe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="gap-2 px-8">
              <Link to="/auth/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/announcements">Browse announcements</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A thoughtful platform built to support families and communities during difficult times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="container pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recent Announcements</h2>
            <p className="text-muted-foreground mt-1">Remembering those who have recently passed.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/announcements">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.data.slice(0, 4).map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[hsl(224,30%,97%)] dark:bg-[hsl(224,40%,12%)] border-y py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Create a memorial announcement today
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of families who have used Funeral Matters to honour and remember their loved ones.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link to="/auth/register">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
