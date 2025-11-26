"use client"

import * as React from "react"
import { Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWebSocketMovers } from "@/hooks/use-websocket-movers"
import { useWatchlists, useAddWatchlistItem } from "@/hooks/use-watchlist"
import { AddToWatchlistDialog } from "@/components/watchlist2/AddToWatchlistDialog"
import { BuiltInStockActionMenu } from "@/components/watchlist2/BuiltInStockActionMenu"
import { cn } from "@/lib/utils"
import type { MoverItem } from "@/lib/types/websocket"

const BUILT_IN_WATCHLIST_NAME = "Top Gainer"

// Memoized row component - only re-renders when its specific data changes
const GainerRow = React.memo(function GainerRow({
  gainer,
  onDoubleClick,
  onContextMenu,
  onAdd,
  canAdd,
  isAdding,
}: {
  gainer: MoverItem
  onDoubleClick: (e: React.MouseEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
  onAdd: () => void
  canAdd: boolean
  isAdding: boolean
}) {
  return (
    <div
      className="px-4 py-3 hover:bg-sidebar-accent/50 transition-colors cursor-pointer select-none"
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm whitespace-nowrap">{gainer.symbol}</span>
          </div>
          {gainer.name && (
            <div className="text-xs text-muted-foreground truncate">{gainer.name}</div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-1 min-w-[120px]">
            <span className="font-semibold text-sm tabular-nums">${gainer.price.toFixed(2)}</span>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn("tabular-nums min-w-[60px] text-right", gainer.changePercent < 0 ? "text-red-500" : "text-green-500")}>
                {gainer.changePercent >= 0 ? "+" : ""}
                {gainer.changePercent.toFixed(2)}%
              </span>
              <span className={cn("tabular-nums min-w-[70px] text-right", gainer.change < 0 ? "text-red-500" : "text-green-500")}>
                ({gainer.change >= 0 ? "+" : ""}${Math.abs(gainer.change).toFixed(2)})
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            disabled={!canAdd || isAdding}
            title="Add to Top Gainer watchlist"
          >
            <Star className="size-4 text-muted-foreground hover:text-yellow-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific values change
  return (
    prevProps.gainer.symbol === nextProps.gainer.symbol &&
    prevProps.gainer.price === nextProps.gainer.price &&
    prevProps.gainer.change === nextProps.gainer.change &&
    prevProps.gainer.changePercent === nextProps.gainer.changePercent &&
    prevProps.gainer.name === nextProps.gainer.name &&
    prevProps.canAdd === nextProps.canAdd &&
    prevProps.isAdding === nextProps.isAdding
  )
})

export default function TopGainerWatchlist() {
  const { movers, error, isInitialLoading } = useWebSocketMovers({ enabled: true })
  
  // Stabilize the gainers array - only update if actual data changes
  const gainers = React.useMemo(() => {
    return movers?.gainers || []
  }, [movers?.gainers])
  
  // Create a stable Map of gainers by symbol to prevent unnecessary re-renders
  const gainersMap = React.useMemo(() => {
    const map = new Map<string, MoverItem>()
    gainers.forEach(gainer => map.set(gainer.symbol, gainer))
    return map
  }, [gainers])
  
  // Stable array of symbols for ordering
  const orderedSymbols = React.useMemo(() => {
    return gainers.map(g => g.symbol)
  }, [gainers])
  
  const [openAddDialog, setOpenAddDialog] = React.useState(false)
  const [openItemMenu, setOpenItemMenu] = React.useState(false)
  const [menuPosition, setMenuPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<{ symbol: string } | null>(null)

  const { data: watchlists = [] } = useWatchlists(true)
  const addWatchlistItem = useAddWatchlistItem()

  // Find the "Top Gainer" watchlist ID
  const builtInWatchlistId = React.useMemo(() => {
    const existing = watchlists.find((w) => w.name.toLowerCase() === BUILT_IN_WATCHLIST_NAME.toLowerCase())
    return existing?.id || ""
  }, [watchlists])

  // Memoize callback handlers to prevent re-creating them on every render
  const handleAdd = React.useCallback(async (symbol: string) => {
    if (!builtInWatchlistId) return
    try {
      await addWatchlistItem.mutateAsync({
        watchlistId: builtInWatchlistId,
        item: { symbol, name: symbol },
      })
    } catch {
      // ignore
    }
  }, [builtInWatchlistId, addWatchlistItem])

  const handleItemAction = React.useCallback((e: React.MouseEvent, symbol: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedItem({ symbol })
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setOpenItemMenu(true)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Add Stocks Button */}
      {gainers.length > 0 && (
        <div className="px-4 py-2 border-b">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setOpenAddDialog(true)}
          >
            <Plus className="size-4" />
            Add stocks
          </Button>
        </div>
      )}

      {/* Add To Watchlist Dialog */}
      <AddToWatchlistDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        symbols={orderedSymbols}
        builtInWatchlistName={BUILT_IN_WATCHLIST_NAME}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-sm text-destructive">Failed to load</div>
        ) : gainers.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No gainers available</div>
        ) : (
          <div className="divide-y">
            {orderedSymbols.map((symbol) => {
              const gainer = gainersMap.get(symbol)
              if (!gainer) return null
              
              return (
                <GainerRow
                  key={symbol}
                  gainer={gainer}
                  onDoubleClick={(e) => handleItemAction(e, symbol)}
                  onContextMenu={(e) => handleItemAction(e, symbol)}
                  onAdd={() => handleAdd(symbol)}
                  canAdd={!!builtInWatchlistId}
                  isAdding={addWatchlistItem.isPending}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <BuiltInStockActionMenu
        open={openItemMenu}
        position={menuPosition}
        selectedItem={selectedItem}
        onClose={() => {
          setOpenItemMenu(false)
          setSelectedItem(null)
        }}
        onAddToWatchlist={() => setOpenAddDialog(true)}
      />
    </div>
  )
}

