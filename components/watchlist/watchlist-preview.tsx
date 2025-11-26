"use client"

import * as React from "react"
import Image from "next/image"
import { Search, Star, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWebSocketQuotes } from "@/hooks/use-websocket-quotes"
import { useWebSocketMovers } from "@/hooks/use-websocket-movers"
import { useDeleteWatchlistItem } from "@/hooks/use-watchlist"
import type { Watchlist, WatchlistItem } from "@/lib/types/watchlist"
import type { MoverItem } from "@/lib/types/websocket"

interface WatchlistPreviewProps {
  watchlistName: string
  isUserWatchlist: boolean
  // For built-in watchlists
  builtInType?: "top-gainers" | "top-losers" | "most-active" | "inside-day" | "high-volume-ever" | "high-volume-year" | "high-volume-quarter"
  // For user watchlists
  userWatchlist?: Watchlist
  // Position
  position: { x: number; y: number }
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// Stock row component for user watchlists
function UserStockRow({
  item,
  quote,
  onRemove,
  isRemoving,
}: {
  item: WatchlistItem
  quote?: { price: number; change: number; changePercent: number }
  onRemove: () => void
  isRemoving: boolean
}) {
  const symbol = item.symbol || item.name

  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors group">
      {/* Logo */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
        {item.logo ? (
          <Image 
            src={item.logo} 
            alt={symbol || ""} 
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            unoptimized
          />
        ) : null}
        <span className={cn("text-xs font-semibold text-muted-foreground", item.logo && "hidden")}>
          {symbol?.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Symbol */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{symbol}</div>
      </div>

      {/* Price & Change */}
      <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
        <span className="font-semibold text-sm tabular-nums">
          ${quote?.price?.toFixed(2) ?? item.price?.toFixed(2) ?? "—"}
        </span>
        {(quote?.changePercent !== undefined || item.percentChange) && (
          <span className={cn(
            "text-xs tabular-nums",
            (quote?.changePercent ?? parseFloat(item.percentChange || "0")) >= 0 
              ? "text-green-500" 
              : "text-red-500"
          )}>
            {(quote?.changePercent ?? parseFloat(item.percentChange || "0")) >= 0 ? "+" : ""}
            {(quote?.changePercent ?? parseFloat(item.percentChange || "0")).toFixed(2)}%
          </span>
        )}
      </div>

      {/* Remove button (star) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        disabled={isRemoving}
        className={cn(
          "p-1.5 rounded-md transition-all",
          "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          isRemoving && "opacity-50 cursor-not-allowed"
        )}
        title="Remove from watchlist"
      >
        <Star className="h-4 w-4 fill-current" />
      </button>
    </div>
  )
}

// Stock row component for built-in watchlists (movers)
function MoverStockRow({
  item,
}: {
  item: MoverItem
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors">
      {/* Logo placeholder */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">
          {item.symbol.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Symbol */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{item.symbol}</div>
      </div>

      {/* Price & Change */}
      <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
        <span className="font-semibold text-sm tabular-nums">
          ${item.price.toFixed(2)}
        </span>
        <span className={cn(
          "text-xs tabular-nums",
          item.changePercent >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {item.changePercent >= 0 ? "+" : ""}
          {item.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

export function WatchlistPreview({
  watchlistName,
  isUserWatchlist,
  builtInType,
  userWatchlist,
  position,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: WatchlistPreviewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const previewRef = React.useRef<HTMLDivElement>(null)

  // Get symbols for user watchlist
  const userSymbols = React.useMemo(() => {
    if (!isUserWatchlist || !userWatchlist?.items) return []
    return userWatchlist.items
      .map(item => item.symbol || item.name)
      .filter((s): s is string => !!s)
  }, [isUserWatchlist, userWatchlist])

  // WebSocket quotes for user watchlists
  const { quotes } = useWebSocketQuotes({
    symbols: userSymbols,
    enabled: isUserWatchlist && userSymbols.length > 0,
  })

  // WebSocket movers for built-in watchlists
  const { movers } = useWebSocketMovers({
    enabled: !isUserWatchlist && !!builtInType,
  })

  // Delete watchlist item mutation
  const deleteItem = useDeleteWatchlistItem()

  // Get items based on watchlist type
  const items = React.useMemo(() => {
    if (isUserWatchlist && userWatchlist?.items) {
      return userWatchlist.items
    }
    return []
  }, [isUserWatchlist, userWatchlist])

  // Get mover items based on built-in type
  const moverItems = React.useMemo(() => {
    if (!movers || isUserWatchlist) return []
    switch (builtInType) {
      case "top-gainers":
        return movers.gainers || []
      case "top-losers":
        return movers.losers || []
      case "most-active":
        return movers.actives || []
      default:
        return []
    }
  }, [movers, builtInType, isUserWatchlist])

  // Filter items based on search
  const filteredUserItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      (item.symbol?.toLowerCase().includes(query)) ||
      (item.name?.toLowerCase().includes(query))
    )
  }, [items, searchQuery])

  const filteredMoverItems = React.useMemo(() => {
    if (!searchQuery.trim()) return moverItems
    const query = searchQuery.toLowerCase()
    return moverItems.filter(item =>
      item.symbol.toLowerCase().includes(query) ||
      (item.name?.toLowerCase().includes(query))
    )
  }, [moverItems, searchQuery])

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId)
    } catch {
      // Error handled by mutation
    }
  }

  // Calculate position (ensure it stays within viewport)
  const style = React.useMemo(() => {
    const width = 320
    const height = 400
    const padding = 16
    const gap = 12 // Gap between dialog and preview

    // Position to the right of the dialog with a gap
    let left = position.x + gap
    let top = position.y

    // Adjust if too close to right edge
    if (left + width + padding > window.innerWidth) {
      left = window.innerWidth - width - padding
    }

    // Adjust if too close to bottom edge
    if (top + height + padding > window.innerHeight) {
      top = window.innerHeight - height - padding
    }

    // Ensure it doesn't go above viewport
    if (top < padding) {
      top = padding
    }

    // Ensure it doesn't go off-screen left
    if (left < padding) {
      left = padding
    }

    return { left, top }
  }, [position])

  const hasItems = isUserWatchlist 
    ? filteredUserItems.length > 0 
    : filteredMoverItems.length > 0

  const totalCount = isUserWatchlist ? items.length : moverItems.length

  return (
    <div
      ref={previewRef}
      className="fixed z-[9999] w-80 bg-popover border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div>
          <h3 className="font-semibold text-sm">{watchlistName}</h3>
          <p className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? "stock" : "stocks"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Stock List */}
      <ScrollArea className="h-[280px]">
        {!hasItems ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {searchQuery ? "No stocks match your search" : "No stocks in this watchlist"}
          </div>
        ) : isUserWatchlist ? (
          <div className="py-1">
            {filteredUserItems.map((item) => {
              const symbol = item.symbol || item.name
              const quote = symbol ? quotes[symbol] : undefined
              return (
                <UserStockRow
                  key={item.id}
                  item={item}
                  quote={quote ? {
                    price: quote.price,
                    change: quote.change,
                    changePercent: quote.changePercent,
                  } : undefined}
                  onRemove={() => handleRemoveItem(item.id)}
                  isRemoving={deleteItem.isPending}
                />
              )
            })}
          </div>
        ) : (
          <div className="py-1">
            {filteredMoverItems.map((item) => (
              <MoverStockRow key={item.symbol} item={item} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

