import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Globe, Brain, Shield, ArrowRight, ChevronDown, Star, Infinity as InfinityIcon, Loader2 } from 'lucide-react'
import { checkDeckAvailability, claimDeckName } from './lib/supabase'

const FEATURES = [
  { icon: Brain, label: 'Your AI Journal', desc: 'Every thought, every memory — your deck remembers everything you feed it.' },
  { icon: Globe, label: 'Your Identity', desc: 'bo.deck. brandi.deck. chad.deck. One name. Every platform.' },
  { icon: Shield, label: 'Yours Forever', desc: 'Death-proof ownership. Your deck outlives you if you want it to.' },
  { icon: InfinityIcon, label: 'Web3 Native', desc: 'Minted on-chain. No corporation can take it from you.' },
]

const PLANS = [
  {
    name: 'Deck',
    price: 99,
    period: 'mo',
    highlight: false,
    description: 'Your personal .deck identity',
    features: [
      'Your own .deck domain (e.g. you.deck)',
      'AI-powered personal journal',
      'Web3 wallet integration',
      'Domain marketplace access',
      'Community membership',
    ],
    cta: 'Claim Your Deck',
  },
  {
    name: 'Studio Deck',
    price: 299,
    period: 'mo',
    highlight: true,
    description: 'For creators and brands',
    features: [
      'Everything in Deck',
      'Up to 5 sub-decks (team.deck)',
      'Brand AI — trained on your content',
      'Priority domain reseller program',
      'Revenue share on referrals',
      'Early access to new features',
    ],
    cta: 'Get Studio',
  },
]

const FAQS = [
  {
    q: 'What is a .deck domain?',
    a: '.deck is a Web3 top-level domain — like .com but owned on blockchain. It\'s your permanent digital identity. No one can take it. No renewal fees. Yours until you decide otherwise.',
  },
  {
    q: 'Can I use it in regular browsers?',
    a: 'Web3 domains are resolving across more platforms every month. We\'re building toward full ICANN recognition. In the meantime, your .deck powers your HotDeck identity, journal, and community — the browser part is coming.',
  },
  {
    q: 'What happens to my deck if I cancel?',
    a: 'Your domain is minted on-chain — it\'s yours. If you cancel your subscription, your deck stays with you. You keep the domain. You lose access to the AI journal and community features until you reactivate.',
  },
  {
    q: 'How does the domain trade-in work?',
    a: 'Bring a .com, .net, or other domain you own. We import it to the Freename Aftermarket, list it for sale, and credit you toward your .deck subscription. Your domains work for you.',
  },
  {
    q: 'When does this launch?',
    a: 'We\'re building in public. Join the waitlist now and be first in line. Founding members get locked-in pricing and bo.deck-style premium domain picks before anyone else.',
  },
]

function UsernameChecker({ tier = 'deck' }: { tier?: 'deck' | 'studio' }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'claiming' | 'claimed' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const clean = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')

  const check = async () => {
    const name = clean(username)
    if (!name) return
    setUsername(name)
    setStatus('checking')
    const result = await checkDeckAvailability(name)
    setStatus(result)
  }

  const claim = async () => {
    if (!email.trim()) return
    setStatus('claiming')
    const result = await claimDeckName(clean(username), email, tier)
    if (result.success) {
      setStatus('claimed')
    } else {
      setErrorMsg(result.error || 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center card-glass rounded-xl px-4 border border-violet-500/30 focus-within:border-violet-500/70 transition-colors">
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setStatus('idle') }}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="yourname"
            className="flex-1 bg-transparent py-4 text-white text-lg outline-none placeholder-white/20"
            maxLength={32}
          />
          <span className="text-violet-400 font-semibold text-lg">.deck</span>
        </div>
        <button
          onClick={check}
          disabled={!username || status === 'checking'}
          className="px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl font-semibold transition-colors whitespace-nowrap"
        >
          {status === 'checking' ? '...' : 'Check'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-white/40 px-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking availability...
          </motion.div>
        )}

        {(status === 'available' || status === 'claiming') && (
          <motion.div key="available" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="w-4 h-4" />
              <span><strong>{username}.deck</strong> is available — lock it in</span>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && claim()}
                placeholder="your@email.com"
                className="flex-1 card-glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-white/20 border border-violet-500/20 focus:border-violet-500/50 transition-colors"
              />
              <button
                onClick={claim}
                disabled={!email || status === 'claiming'}
                className="px-5 py-3 deck-glow bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {status === 'claiming' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Claim it</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        )}

        {status === 'claimed' && (
          <motion.div key="claimed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-3 px-4 py-4 rounded-xl bg-violet-600/20 border border-violet-500/40 text-center">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-white font-bold">{username}.deck is reserved for you.</p>
            <p className="text-white/50 text-sm mt-1">You're on the founding member list. We'll email you at launch with your exclusive pricing.</p>
          </motion.div>
        )}

        {status === 'taken' && (
          <motion.div key="taken" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <span>✗</span>
            <span><strong>{username}.deck</strong> is taken — try another name</span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-sm px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <span>⚠️ {errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card-glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white/90">{q}</span>
        <ChevronDown className={`w-5 h-5 text-violet-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-white/60 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#080810]">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl bg-[#080810]/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          <span className="font-bold text-lg">hotdeck<span className="text-violet-400">.club</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="#what" className="hover:text-white transition-colors">What is it</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold transition-colors">
          Join Waitlist
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
              <Star className="w-3.5 h-3.5 fill-violet-400" />
              Founding member spots open — limited availability
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Your deck.<br />
              <span className="gradient-text">Your identity.</span><br />
              Forever.
            </h1>

            <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Claim your <span className="text-violet-400 font-semibold">.deck</span> — a permanent Web3 identity powered by AI. Your journal. Your memories. Your community. No one can take it from you.
            </p>
          </motion.div>

          {/* Video placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-2xl mx-auto mb-12 rounded-2xl overflow-hidden card-glass float"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-violet-900/20 to-blue-900/20">
              <div className="w-16 h-16 rounded-full bg-violet-600/30 flex items-center justify-center border border-violet-500/40 cursor-pointer hover:bg-violet-600/50 transition-colors">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
              <p className="text-white/40 text-sm">Watch: What is your .deck? (60 sec)</p>
            </div>
          </motion.div>

          {/* Username checker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white/40 text-sm mb-4">Check if your name is available</p>
            <UsernameChecker />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* What is it */}
      <section id="what" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Not just a domain.<br /><span className="gradient-text">Your whole world.</span></h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Your .deck is your AI-powered home on the internet. It knows you. It remembers everything. It grows with you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{f.label}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bring your domain */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass rounded-3xl p-8 md:p-12 text-center border border-violet-500/10">
            <div className="text-4xl mb-4">🔄</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Own a domain? <span className="gradient-text">Trade it in.</span></h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Bring your .com, .net, or any domain you own. We list it on the Web3 marketplace and credit you toward your .deck. Your old domains finally work for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> .com accepted</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> .net accepted</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> .org accepted</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> 400+ TLDs accepted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, honest <span className="gradient-text">pricing.</span></h2>
            <p className="text-white/50 text-lg">No hidden fees. No surprises. Your domain is yours forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-violet-600/20 border-2 border-violet-500/50 deck-glow'
                    : 'card-glass'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold text-violet-300 bg-violet-500/20 px-3 py-1 rounded-full w-fit mb-4">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">${plan.price}</span>
                  <span className="text-white/40">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'border border-white/10 hover:bg-white/5 text-white'
                }`}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12">Questions? <span className="gradient-text">Answered.</span></h2>
          <div className="space-y-3">
            {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 float">🃏</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ready to claim<br /><span className="gradient-text">your deck?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">Founding member slots are limited. Lock in your name before someone else does.</p>
          <UsernameChecker />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <span>🃏</span>
            <span>hotdeck.club — a Hot Hands LLC product</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
