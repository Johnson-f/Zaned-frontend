"use client"

import { SelectWatchlist, CreateWatchlistButton, type WatchlistSelection } from "@/components/watchlist/select-watchlist"
import type { Watchlist } from "@/lib/types/watchlist"

interface SecondaryHeaderProps {
  onWatchlistChange?: (watchlist: WatchlistSelection | null) => void
  onUserWatchlistSelect?: (watchlist: Watchlist) => void
}

export function SecondaryHeader({ onWatchlistChange, onUserWatchlistSelect }: SecondaryHeaderProps) {
  return (
    <div className="flex items-center h-10 bg-muted/30">
      {/* Section above secondary sidebar - no bottom border */}
      <div className="hidden md:flex w-[var(--secondary-sidebar-width)] h-full shrink-0" />
      {/* Main content area header */}
      <div className="flex items-center flex-1 h-full px-4 border-b border-border">
        {/* Left side - main content area controls */}
      </div>
      {/* Right side - above watchlist, aligned with watchlist panel */}
      <div className="hidden lg:flex h-full items-center gap-1 pl-4 pr-8 border-b border-l border-border bg-background">
        <SelectWatchlist 
          onWatchlistChange={onWatchlistChange} 
          onUserWatchlistSelect={onUserWatchlistSelect}
        />
        <div className="w-px h-4 bg-border" />
        <CreateWatchlistButton />
      </div>
    </div>
  )
}
