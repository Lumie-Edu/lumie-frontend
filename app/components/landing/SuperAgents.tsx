'use client';

import Image from 'next/image';
import {
  Brain,
  Sparkles,
  MessageSquare,
  ListTodo,
  Settings,
  Mic,
  Square,
  Command,
  Monitor,
  Chrome,
  Apple,
} from 'lucide-react';

// Pre-generated waveform heights to avoid hydration mismatch from Math.random()
const WAVEFORM_HEIGHTS = [
  35, 52, 28, 65, 42, 58, 30, 70, 45, 38,
  55, 25, 68, 48, 32, 60, 40, 72, 35, 50,
  62, 28, 55, 45, 38, 70, 32, 58, 48, 25,
  65, 42, 55, 30, 68, 52, 38, 60, 45, 72,
  35, 48, 62, 28, 55, 40, 70, 32, 58, 50,
];

export default function SuperAgents() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Black Container */}
        <div className="bg-black rounded-[2.5rem] overflow-hidden">
          {/* Hero Section */}
          <div className="relative px-10 sm:px-20 lg:px-32 xl:px-40 pt-20 sm:pt-32 pb-16 sm:pb-24">
            {/* Floating Labels */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <span className="absolute top-20 left-[12%] text-xs sm:text-sm tracking-[0.25em] text-white/20 uppercase">Update Task</span>
              <span className="absolute top-32 right-[12%] text-xs sm:text-sm tracking-[0.25em] text-white/20 uppercase">Send Email</span>
              <span className="absolute top-44 left-[22%] text-xs sm:text-sm tracking-[0.25em] text-white/20 uppercase">Create Event</span>
              <span className="absolute top-56 right-[22%] text-xs sm:text-sm tracking-[0.25em] text-white/20 uppercase">Complete Task</span>
            </div>

            {/* Brain Icon */}
            <div className="relative flex justify-center mb-8">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 scale-150" />
                {/* Icon container */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <p className="text-white/80 text-base sm:text-lg font-medium mb-6">Lumie Brain</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                The only AI that works
                <br />
                <span className="italic font-normal text-white/80">where you work</span>
              </h2>
              <button className="mt-6 px-8 sm:px-10 py-4 bg-white text-black text-base font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                Try Brain today
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="px-4 sm:px-10 md:px-20 lg:px-32 xl:px-40 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-[1030px] mx-auto">
              {/* Card 1: @Brain Agent */}
              <div className="relative bg-transparent rounded-xl p-4 sm:p-5 lg:p-6 border border-neutral-800 overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] mx-auto md:mx-0 max-w-[330px] w-full">
                {/* Inner edge gradient - 20% edges */}
                <div className="absolute inset-0 pointer-events-none rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-neutral-900 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-gradient-to-r from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-[20%] bg-gradient-to-l from-neutral-900 to-transparent" />
                </div>
                <p className="relative text-[10px] sm:text-xs tracking-[0.2em] text-purple-400 uppercase mb-3">@Brain Agent</p>
                <h3 className="relative text-lg sm:text-xl font-bold text-white mb-6 leading-snug">
                  Use @Brain for a 24/7 intelligent assistant.
                </h3>
                {/* Chat mockup */}
                <div className="relative bg-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/60">Zach <span className="text-white/40">Mar 3, 4:01pm</span></p>
                      <p className="text-sm text-white/80 mt-1">
                        <span className="text-purple-400">@Brain</span> Pull last week's campaign stats and draft a presentation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Lumie Brain <span className="text-white/40">Mar 3, 4:02pm</span></p>
                      <p className="text-sm text-white/80 mt-1">Here are the key performance stats from last quarter's campaigns...</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Ambient Answers */}
              <div className="relative bg-transparent rounded-xl p-4 sm:p-5 lg:p-6 border border-neutral-800 overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] mx-auto md:mx-0 max-w-[330px] w-full">
                {/* Inner edge gradient - 20% edges */}
                <div className="absolute inset-0 pointer-events-none rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-neutral-900 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-gradient-to-r from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-[20%] bg-gradient-to-l from-neutral-900 to-transparent" />
                </div>
                <p className="relative text-[10px] sm:text-xs tracking-[0.2em] text-purple-400 uppercase mb-3">Ambient Answers</p>
                <h3 className="relative text-lg sm:text-xl font-bold text-white mb-6 leading-snug">
                  Humans no longer answer questions.
                </h3>
                {/* Chat mockup */}
                <div className="relative bg-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/60">Maggie <span className="text-white/40">10:15 am</span></p>
                      <p className="text-sm text-white/80 mt-1">Where is the final logo file for the spring campaign?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Agent <span className="text-white/40">10:16 am</span></p>
                      <p className="text-sm text-white/80 mt-1">Hey! The final logo file for the spring campaign is here:</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-purple-400">
                        <span>📁</span> Spring Campaign Logo
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Project Manager */}
              <div className="relative bg-transparent rounded-xl p-4 sm:p-5 lg:p-6 border border-neutral-800 overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] mx-auto md:mx-0 max-w-[330px] w-full">
                {/* Inner edge gradient - 20% edges */}
                <div className="absolute inset-0 pointer-events-none rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-neutral-900 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-gradient-to-r from-neutral-900 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-[20%] bg-gradient-to-l from-neutral-900 to-transparent" />
                </div>
                <p className="relative text-[10px] sm:text-xs tracking-[0.2em] text-purple-400 uppercase mb-3">Project Manager</p>
                <h3 className="relative text-lg sm:text-xl font-bold text-white mb-6 leading-snug">
                  Never manually assign tasks again.
                </h3>
                {/* Task mockup */}
                <div className="relative bg-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/60">Alex <span className="text-white/40">3:28 pm</span></p>
                      <p className="text-sm text-white/80 mt-1">The discount code isn't applying in the checkout flow.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Agent <span className="text-white/40">3:30 pm</span></p>
                      <p className="text-sm text-white/80 mt-1">Got it! I've created a task for this:</p>
                      <div className="mt-2 space-y-1 text-xs text-white/60">
                        <p><span className="text-blue-400">●</span> Fix discount code issue</p>
                        <p>• Priority: High</p>
                        <p>• Assignee: <span className="text-purple-400">@Ashley</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Section */}
          <div className="px-4 sm:px-10 md:px-20 lg:px-32 xl:px-40 pb-8">
            <div className="bg-neutral-900 rounded-xl p-6 sm:p-8 lg:p-10 border border-neutral-800 max-w-[1030px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
                {/* Left Content */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold">Brain</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full uppercase tracking-wider">New</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                    Type 4x faster with AI Talk to Text, instantly perfected to write like you.
                  </h3>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Replaces <span className="text-white/60">Flow</span></p>
                  <p className="text-white/60 mb-5">Save 2 hours every day, guaranteed.</p>
                  <div className="flex items-center gap-3 text-white/40 text-xs mb-6">
                    <span>Available for</span>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>Windows,</span>
                      <Chrome className="w-4 h-4" />
                      <span>Chrome and</span>
                      <Apple className="w-4 h-4" />
                      <span>Mac</span>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 border border-white/20 text-white text-sm rounded-lg hover:bg-white/5 transition-colors">
                    Download free
                  </button>
                </div>

                {/* Right Content - Waveform */}
                <div className="bg-neutral-800 rounded-xl p-6">
                  {/* Waveform visualization */}
                  <div className="h-20 flex items-center justify-center gap-0.5 mb-6">
                    {WAVEFORM_HEIGHTS.map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
                    <span>Stop</span>
                    <div className="flex items-center gap-1">
                      <Command className="w-4 h-4" />
                      <span>⌘</span>
                    </div>
                    <span>Close</span>
                    <span>Esc</span>
                  </div>
                  {/* Product Hunt Badge */}
                  <div className="mt-6 flex justify-end">
                    <div className="flex items-center gap-2 bg-neutral-700 px-3 py-2 rounded-lg">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                      <div>
                        <p className="text-[10px] text-white/40">Product Hunt</p>
                        <p className="text-xs text-white font-semibold">#1 Product of the Week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="px-4 sm:px-10 md:px-20 lg:px-32 xl:px-40 pb-10 sm:pb-12 md:pb-16 lg:pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8 lg:gap-10 max-w-[1030px] mx-auto">
              {/* Your company's AI */}
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="w-32 sm:w-36 h-14 sm:h-16 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-center">
                      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-700 rounded-lg">
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
                        <span className="text-xs sm:text-sm text-white/80">Sound like me</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Your company's AI</h4>
                <p className="text-white/40 text-xs sm:text-sm">A superhuman brain built for you and your team.</p>
              </div>

              {/* Connected to 50+ apps */}
              <div className="text-center sm:border-x border-neutral-800 px-4 py-4 sm:py-0 border-y sm:border-y-0">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {['📷', '📅', '📧', '🏔️', '🎨', '🔷', '💠', '⬛'].map((emoji, i) => (
                      <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-base sm:text-lg">
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Connected to 50+ apps</h4>
                <p className="text-white/40 text-xs sm:text-sm">Superpowers to complete 500+ human tasks.</p>
              </div>

              {/* Every AI */}
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="flex items-center -space-x-2">
                    {['⚡', '✨', '🔮', '🌟', '💫'].map((emoji, i) => (
                      <div
                        key={i}
                        className={`rounded-full bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center text-base sm:text-lg ${i === 2 ? 'w-11 h-11 sm:w-14 sm:h-14 z-10' : 'w-8 h-8 sm:w-10 sm:h-10'}`}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Every AI</h4>
                <p className="text-white/40 text-xs sm:text-sm">ChatGPT, Claude, Gemini — unlimited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
