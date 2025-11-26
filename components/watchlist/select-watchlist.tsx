"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { ChevronDown, List, TrendingUp, TrendingDown, Activity, Zap, Star, BarChart3, Plus, FolderOpen, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWebSocketMovers } from "@/hooks/use-websocket-movers"
import { useScreenerResults } from "@/hooks/use-historical"
import { useWatchlists, useCreateWatchlist, useDeleteWatchlist } from "@/hooks/use-watchlist"
import type { Watchlist } from "@/lib/types/watchlist"
import { WatchlistPreview } from "./watchlist-preview"

// Dynamically import built-in watchlist components
const HighestVolumeEverWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/high-volume-ever"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const HighestVolumeYearWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/high-volume-year"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const HighestVolumeQuarterWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/high-volume-quarter"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const InsideDayWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/inside-day"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const TopLoserWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/top-loser"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const TopGainerWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/top-gainer"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

const MostActiveWatchlist = dynamic(
  () => import("@/components/watchlist/bulit-in/most-active"),
  { loading: () => <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading...</div> }
)

interface BuiltInWatchlist {
  id: string
  name: string
  description: string
  icon: React.ElementType
  component?: React.ComponentType
  isUserWatchlist?: false
}

interface UserWatchlistSelection {
  id: string
  name: string
  description: string
  icon: React.ElementType
  isUserWatchlist: true
  itemCount: number
}

type WatchlistSelection = BuiltInWatchlist | UserWatchlistSelection

const builtInWatchlists: BuiltInWatchlist[] = [
  {
    id: "high-volume-ever",
    name: "Highest Volume Ever",
    description: "Stocks with highest volume in history",
    icon: BarChart3,
    component: HighestVolumeEverWatchlist,
  },
  {
    id: "high-volume-year",
    name: "Highest Volume Year",
    description: "Stocks with highest volume this year",
    icon: BarChart3,
    component: HighestVolumeYearWatchlist,
  },
  {
    id: "high-volume-quarter",
    name: "Highest Volume Quarter",
    description: "Stocks with highest volume this quarter",
    icon: BarChart3,
    component: HighestVolumeQuarterWatchlist,
  },
  {
    id: "inside-day",
    name: "Inside Day",
    description: "Stocks with inside day pattern",
    icon: Activity,
    component: InsideDayWatchlist,
  },
  {
    id: "top-gainers",
    name: "Top Gainers",
    description: "Stocks with highest daily gains",
    icon: TrendingUp,
    component: TopGainerWatchlist,
  },
  {
    id: "top-losers",
    name: "Top Losers",
    description: "Stocks with biggest daily losses",
    icon: TrendingDown,
    component: TopLoserWatchlist,
  },
  {
    id: "most-active",
    name: "Most Active",
    description: "Highest volume stocks today",
    icon: Zap,
    component: MostActiveWatchlist,
  },
  {
    id: "52-week-high",
    name: "52 Week High",
    description: "Stocks at 52 week highs",
    icon: TrendingUp,
  },
  {
    id: "52-week-low",
    name: "52 Week Low",
    description: "Stocks at 52 week lows",
    icon: TrendingDown,
  },
  {
    id: "high-short-interest",
    name: "High Short Interest",
    description: "Stocks with high short interest ratio",
    icon: Activity,
  },
  {
    id: "earnings-today",
    name: "Earnings Today",
    description: "Companies reporting earnings today",
    icon: List,
  },
  {
    id: "ipo-watchlist",
    name: "Recent IPOs",
    description: "Recently listed IPO stocks",
    icon: Star,
  },
  {
    id: "dividend-stocks",
    name: "Dividend Stocks",
    description: "High dividend yield stocks",
    icon: Activity,
  },
  {
    id: "penny-stocks",
    name: "Penny Stocks",
    description: "Stocks under $5",
    icon: Zap,
  },
  {
    id: "blue-chips",
    name: "Blue Chips",
    description: "Large cap established companies",
    icon: Star,
  },
]

interface SelectWatchlistProps {
  onWatchlistChange?: (watchlist: WatchlistSelection | null) => void
  onUserWatchlistSelect?: (watchlist: Watchlist) => void
}

// Helper component to display stock count badge for built-in watchlists
function BuiltInBadge({ count }: { count: number | null }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {count !== null && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {count} stocks
        </span>
      )}
      <span className="text-[10px] text-emerald-500 font-medium">
        Built-in
      </span>
    </div>
  )
}

// Helper component to display stock count badge for user watchlists
function UserWatchlistBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {count} stocks
      </span>
      <span className="text-[10px] text-blue-500 font-medium">
        Your watchlist
      </span>
    </div>
  )
}

// Create Watchlist Dialog Component
function CreateWatchlistDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (watchlist: Watchlist) => void
}) {
  const [name, setName] = React.useState("")
  const createWatchlist = useCreateWatchlist()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    try {
      const watchlist = await createWatchlist.mutateAsync(name.trim())
      setName("")
      onOpenChange(false)
      if (watchlist) {
        onSuccess?.(watchlist)
      }
    } catch {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Watchlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Watchlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || createWatchlist.isPending}
            >
              {createWatchlist.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Type for preview state
interface PreviewState {
  watchlistName: string
  isUserWatchlist: boolean
  builtInType?: "top-gainers" | "top-losers" | "most-active" | "inside-day" | "high-volume-ever" | "high-volume-year" | "high-volume-quarter"
  userWatchlist?: Watchlist
  position: { x: number; y: number }
}

export function SelectWatchlist({ onWatchlistChange, onUserWatchlistSelect }: SelectWatchlistProps) {
  const [open, setOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedWatchlist, setSelectedWatchlist] = React.useState<WatchlistSelection | null>(null)
  const [previewState, setPreviewState] = React.useState<PreviewState | null>(null)
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isMouseOverPreviewRef = React.useRef(false)

  // Clean up preview when dialog closes
  React.useEffect(() => {
    if (!open) {
      setPreviewState(null)
      isMouseOverPreviewRef.current = false
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [open])

  // Get user's watchlists
  const { data: userWatchlists = [] } = useWatchlists(open)
  const deleteWatchlist = useDeleteWatchlist()

  // Get movers data for WebSocket-based watchlists (only when dialog is open)
  const { movers } = useWebSocketMovers({ enabled: open })
  
  // Get screener data for screener-based watchlists (only when dialog is open)
  const { data: insideDayData } = useScreenerResults("inside_day", "all", open)
  const { data: highVolumeEverData } = useScreenerResults("high_volume_ever", "all", open)
  const { data: highVolumeYearData } = useScreenerResults("high_volume_year", "all", open)
  const { data: highVolumeQuarterData } = useScreenerResults("high_volume_quarter", "all", open)
  
  // Build a map of watchlist ID to stock count
  const stockCounts = React.useMemo(() => {
    const counts: Record<string, number | null> = {
      "top-gainers": movers?.gainers?.length ?? null,
      "top-losers": movers?.losers?.length ?? null,
      "most-active": movers?.actives?.length ?? null,
      "inside-day": insideDayData?.symbols?.length ?? null,
      "high-volume-ever": highVolumeEverData?.symbols?.length ?? null,
      "high-volume-year": highVolumeYearData?.symbols?.length ?? null,
      "high-volume-quarter": highVolumeQuarterData?.symbols?.length ?? null,
    }
    return counts
  }, [movers, insideDayData, highVolumeEverData, highVolumeYearData, highVolumeQuarterData])

  const handleSelectBuiltIn = (watchlist: BuiltInWatchlist) => {
    setSelectedWatchlist(watchlist)
    onWatchlistChange?.(watchlist)
    setOpen(false)
  }

  const handleSelectUserWatchlist = (watchlist: Watchlist) => {
    const selection: UserWatchlistSelection = {
      id: watchlist.id,
      name: watchlist.name,
      description: `${watchlist.items?.length || 0} stocks`,
      icon: FolderOpen,
      isUserWatchlist: true,
      itemCount: watchlist.items?.length || 0,
    }
    setSelectedWatchlist(selection)
    onWatchlistChange?.(selection)
    onUserWatchlistSelect?.(watchlist)
    setOpen(false)
  }

  const handleCreateSuccess = (watchlist: Watchlist) => {
    handleSelectUserWatchlist(watchlist)
  }

  const handleDeleteWatchlist = async (e: React.MouseEvent, watchlistId: string) => {
    e.stopPropagation() // Prevent selecting the watchlist when clicking delete
    try {
      await deleteWatchlist.mutateAsync(watchlistId)
      // If the deleted watchlist was selected, clear the selection
      if (selectedWatchlist?.id === watchlistId) {
        setSelectedWatchlist(null)
        onWatchlistChange?.(null)
      }
    } catch {
      // Error is handled by the mutation
    }
  }

  // Handle hover on built-in watchlist
  const handleBuiltInHover = (
    e: React.MouseEvent,
    watchlist: BuiltInWatchlist
  ) => {
    // Only show preview for watchlists with components (active ones)
    if (!watchlist.component) return
    
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Find the dialog content and get its right edge
    const dialogContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]')
    const dialogRect = dialogContent?.getBoundingClientRect()
    const rowRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    
    // Position preview to the right of the dialog
    const positionX = dialogRect ? dialogRect.right : rowRect.right
    const positionY = rowRect.top
    
    // Delay to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewState({
        watchlistName: watchlist.name,
        isUserWatchlist: false,
        builtInType: watchlist.id as PreviewState["builtInType"],
        position: { x: positionX, y: positionY },
      })
    }, 200)
  }

  // Handle hover on user watchlist
  const handleUserWatchlistHover = (
    e: React.MouseEvent,
    watchlist: Watchlist
  ) => {
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Find the dialog content and get its right edge
    const dialogContent = (e.currentTarget as HTMLElement).closest('[role="dialog"]')
    const dialogRect = dialogContent?.getBoundingClientRect()
    const rowRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    
    // Position preview to the right of the dialog
    const positionX = dialogRect ? dialogRect.right : rowRect.right
    const positionY = rowRect.top
    
    // Delay to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewState({
        watchlistName: watchlist.name,
        isUserWatchlist: true,
        userWatchlist: watchlist,
        position: { x: positionX, y: positionY },
      })
    }, 200)
  }

  // Handle mouse leave from watchlist row
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    
    // Delay before closing to allow moving to the preview
    closeTimeoutRef.current = setTimeout(() => {
      // Only close if mouse is not over the preview
      if (!isMouseOverPreviewRef.current) {
        setPreviewState(null)
      }
    }, 200)
  }

  // Handle mouse enter on preview
  const handlePreviewMouseEnter = () => {
    isMouseOverPreviewRef.current = true
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  // Handle mouse leave from preview
  const handlePreviewMouseLeave = () => {
    isMouseOverPreviewRef.current = false
    // Close the preview when mouse leaves it
    closeTimeoutRef.current = setTimeout(() => {
      setPreviewState(null)
    }, 150)
  }

  // Close preview immediately
  const closePreview = () => {
    isMouseOverPreviewRef.current = false
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setPreviewState(null)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
        >
          {selectedWatchlist ? (
            <>
              <selectedWatchlist.icon className="h-3.5 w-3.5" />
              <span>{selectedWatchlist.name}</span>
            </>
          ) : (
            <>
              <List className="h-3.5 w-3.5" />
              <span>Select watchlist</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Watchlist</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
            <div className="flex flex-col gap-4">
              {/* User Watchlists Section */}
              {userWatchlists.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Your Watchlists
                  </div>
          <div className="flex flex-col gap-1">
                    {userWatchlists.map((watchlist) => (
                      <div
                        key={watchlist.id}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors group",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedWatchlist?.id === watchlist.id && "bg-accent text-accent-foreground"
                        )}
                        onMouseEnter={(e) => handleUserWatchlistHover(e, watchlist)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          onClick={() => handleSelectUserWatchlist(watchlist)}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-blue-500/10 shrink-0">
                            <FolderOpen className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium text-sm">{watchlist.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              Custom watchlist
                            </div>
                          </div>
                        </button>
                        <UserWatchlistBadge count={watchlist.items?.length || 0} />
                        <button
                          onClick={(e) => handleDeleteWatchlist(e, watchlist.id)}
                          disabled={deleteWatchlist.isPending}
                          className={cn(
                            "p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100",
                            "hover:bg-destructive/10 hover:text-destructive",
                            "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/20",
                            deleteWatchlist.isPending && "opacity-50 cursor-not-allowed"
                          )}
                          title="Delete watchlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Watchlist Button */}
              <button
                onClick={() => {
                  setOpen(false)
                  setCreateDialogOpen(true)
                }}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors",
                  "hover:bg-accent hover:text-accent-foreground border border-dashed border-muted-foreground/30"
                )}
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted shrink-0">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Create Watchlist</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Start a new custom watchlist
                  </div>
                </div>
              </button>

              {/* Built-in Watchlists Section */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Built-in Watchlists
                </div>
                <div className="flex flex-col gap-1">
                  {builtInWatchlists.map((watchlist) => (
                    <button
                      key={watchlist.id}
                      onClick={() => handleSelectBuiltIn(watchlist)}
                      onMouseEnter={(e) => handleBuiltInHover(e, watchlist)}
                      onMouseLeave={handleMouseLeave}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedWatchlist?.id === watchlist.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted shrink-0">
                        <watchlist.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{watchlist.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {watchlist.description}
                        </div>
                      </div>
                      {watchlist.component && (
                        <BuiltInBadge count={stockCounts[watchlist.id] ?? null} />
                      )}
              </button>
            ))}
                </div>
              </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

      {/* Create Watchlist Dialog */}
      <CreateWatchlistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Watchlist Preview on Hover */}
      {previewState && (
        <WatchlistPreview
          watchlistName={previewState.watchlistName}
          isUserWatchlist={previewState.isUserWatchlist}
          builtInType={previewState.builtInType}
          userWatchlist={previewState.userWatchlist}
          position={previewState.position}
          onClose={closePreview}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        />
      )}
    </>
  )
}

// Standalone Create Watchlist Button for use in header
export function CreateWatchlistButton({ onSuccess }: { onSuccess?: (watchlist: Watchlist) => void }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </Button>
      <CreateWatchlistDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </>
  )
}

// Export the watchlist data and selected component for use in other components
export { builtInWatchlists }
export type { BuiltInWatchlist, UserWatchlistSelection, WatchlistSelection } 