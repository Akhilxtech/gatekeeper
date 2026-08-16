"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Brain,
  GitPullRequest,
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/* ──────────────────────────────────────────────
   Intersection Observer hook for scroll reveals
   ────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll(".reveal, .reveal-stagger");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Bot,
    title: "AI Code Review",
    description:
      "Get intelligent, context-aware reviews on every pull request. Catches bugs, anti-patterns, and security issues before they reach production.",
  },
  {
    icon: Brain,
    title: "Codebase-Aware",
    description:
      "GateKeeper indexes your entire repository to understand architecture, conventions, and patterns — delivering reviews that actually make sense.",
  },
  {
    icon: GithubLogo,
    title: "GitHub Integration",
    description:
      "One-click GitHub App installation. Reviews appear as PR comments — no context switching, no extra dashboards to check.",
  },
  {
    icon: MessageSquare,
    title: "Actionable Feedback",
    description:
      "Not just linting. Detailed explanations, suggested fixes, and severity levels help your team ship confidently and learn continuously.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Install the GitHub App",
    description:
      "Connect your repositories in under a minute. GateKeeper indexes your codebase to understand your project.",
  },
  {
    step: "02",
    title: "Open a Pull Request",
    description:
      "Push code as you normally would. GateKeeper automatically triggers a review on every new or updated PR.",
  },
  {
    step: "03",
    title: "Review & Ship",
    description:
      "Get detailed AI comments directly in your PR. Fix issues, merge with confidence, and move faster.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for solo developers and small side projects.",
    features: [
      "Up to 5 AI reviews per month",
      "Public & private repositories",
      "Codebase indexing",
      "PR comment integration",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/sign-in",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹500",
    period: "/month",
    description: "For teams and professionals who ship code every day.",
    features: [
      "Unlimited AI reviews",
      "Public & private repositories",
      "Codebase indexing",
      "PR comment integration",
      "Priority support",
      "Advanced review insights",
    ],
    cta: "Upgrade to Pro",
    href: "/sign-in",
    highlighted: true,
  },
];

/* ──────────────────────────────────────────────
   Page Component
   ────────────────────────────────────────────── */
export default function LandingPage() {
  const wrapperRef = useScrollReveal();

  return (
    <div ref={wrapperRef} className="relative min-h-screen bg-[oklch(0.10_0_0)] text-white">
      {/* ── Navigation ── */}
      <nav className="glass-nav fixed top-0 z-50 w-full">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/gatekeeper-logo.svg"
              alt="GateKeeper"
              width={32}
              height={32}
              className="invert"
            />
            <span className="text-lg font-semibold tracking-tight">GateKeeper</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Pricing
            </a>
          </div>

          <Link href="/sign-in">
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-16 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="animate-pulse-glow absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "700px",
              height: "400px",
              background:
                "radial-gradient(ellipse, oklch(0.45 0.14 160 / 18%) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          {/* Badge */}
          <div className="animate-fade-in-up flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-4 py-1.5 text-xs font-medium text-zinc-300">
            <Zap className="size-3 text-emerald-400" />
            AI-Powered Code Reviews for GitHub
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Code Reviews That
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Ship Better Code
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            GateKeeper reviews every pull request with deep codebase understanding.
            Catch bugs, enforce standards, and accelerate your team — automatically.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200"
              >
                <GithubLogo className="mr-2 size-4" />
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <p className="animate-fade-in-up delay-400 mt-4 text-xs text-zinc-500">
            Free tier available · No credit card required · Setup in 60 seconds
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for smarter reviews
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              From automatic bug detection to architecture-aware suggestions — GateKeeper
              understands your code like a senior engineer.
            </p>
          </div>

          <div className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card group rounded-xl p-6 transition-all duration-300"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-400 transition-colors group-hover:bg-emerald-600/25">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative px-6 py-28 bg-[oklch(0.08_0_0)]">
        <div className="mx-auto max-w-5xl">
          <div className="reveal mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="reveal-stagger grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="relative flex flex-col gap-4">
                <span className="text-5xl font-black text-zinc-800">{s.step}</span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <div className="reveal mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Start free, upgrade when you need unlimited reviews. No hidden fees.
            </p>
          </div>

          <div className="reveal-stagger grid gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-emerald-500/30 bg-[oklch(0.14_0.01_160_/_50%)] shadow-lg shadow-emerald-900/10"
                    : "border-zinc-800 bg-[oklch(0.14_0_0)]"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-zinc-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className={`w-full transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500"
                        : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative px-6 py-20 bg-[oklch(0.08_0_0)]">
        <div className="reveal mx-auto max-w-3xl text-center">
          <Shield className="mx-auto mb-5 size-10 text-emerald-400" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to upgrade your code reviews?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-zinc-400">
            Join developers who ship faster and more confidently with AI-powered reviews.
          </p>
          <Link href="/sign-in" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-emerald-600 px-10 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/60 px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2">
              <Image
                src="/gatekeeper-logo.svg"
                alt="GateKeeper"
                width={24}
                height={24}
                className="invert"
              />
              <span className="font-semibold">GateKeeper</span>
            </div>
            <p className="text-xs text-zinc-500">
              AI-powered code reviews for modern teams.
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="font-medium text-zinc-300">Product</p>
              <a href="#features" className="text-zinc-500 hover:text-zinc-300 transition-colors">Features</a>
              <a href="#pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-zinc-500 hover:text-zinc-300 transition-colors">How it Works</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-medium text-zinc-300">Account</p>
              <Link href="/sign-in" className="text-zinc-500 hover:text-zinc-300 transition-colors">Sign In</Link>
              <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-zinc-800/60 pt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} GateKeeper. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
