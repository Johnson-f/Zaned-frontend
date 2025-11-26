"use client"

import { SelectWatchlist } from "@/components/watchlist/select-watchlist"

export function SecondaryHeader() {
  return (
    <div className="flex items-center h-10 bg-muted/30">
      {/* Section above secondary sidebar - no bottom border */}
      <div className="hidden md:flex w-[var(--secondary-sidebar-width)] h-full shrink-0" />
      {/* Main content area header */}
      <div className="flex items-center flex-1 h-full px-4 border-b border-border">
        {/* Left side - main content area controls */}
      </div>
      {/* Right side - above watchlist, aligned with watchlist panel */}
      <div className="hidden lg:flex h-full items-center pl-4 pr-8 border-b border-l border-border bg-background">
        <SelectWatchlist />
      </div>
    </div>
  )
}
