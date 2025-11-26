"use client"

import * as React from "react"
import { ChevronDown, List, TrendingUp, TrendingDown, Activity, Zap, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BuiltInWatchlist {
  id: string
  name: string
  description: string
  icon: React.ElementType
  stockCount: number
}

const builtInWatchlists: BuiltInWatchlist[] = [
  {
    id: "inside-day",
    name: "Inside Day",
    description: "Stocks with inside day pattern",
    icon: Activity,
    stockCount: 24,
  },
  {
    id: "top-gainers",
    name: "Top Gainers",
    description: "Stocks with highest daily gains",
    icon: TrendingUp,
    stockCount: 50,
  },
  {
    id: "top-losers",
    name: "Top Losers",
    description: "Stocks with biggest daily losses",
    icon: TrendingDown,
    stockCount: 50,
  },
  {
    id: "most-active",
    name: "Most Active",
    description: "Highest volume stocks today",
    icon: Zap,
    stockCount: 30,
  },
  {
    id: "52-week-high",
    name: "52 Week High",
    description: "Stocks at 52 week highs",
    icon: TrendingUp,
    stockCount: 45,
  },
  {
    id: "52-week-low",
    name: "52 Week Low",
    description: "Stocks at 52 week lows",
    icon: TrendingDown,
    stockCount: 38,
  },
  {
    id: "high-short-interest",
    name: "High Short Interest",
    description: "Stocks with high short interest ratio",
    icon: Activity,
    stockCount: 25,
  },
  {
    id: "earnings-today",
    name: "Earnings Today",
    description: "Companies reporting earnings today",
    icon: List,
    stockCount: 12,
  },
  {
    id: "ipo-watchlist",
    name: "Recent IPOs",
    description: "Recently listed IPO stocks",
    icon: Star,
    stockCount: 20,
  },
  {
    id: "dividend-stocks",
    name: "Dividend Stocks",
    description: "High dividend yield stocks",
    icon: Activity,
    stockCount: 35,
  },
  {
    id: "penny-stocks",
    name: "Penny Stocks",
    description: "Stocks under $5",
    icon: Zap,
    stockCount: 100,
  },
  {
    id: "blue-chips",
    name: "Blue Chips",
    description: "Large cap established companies",
    icon: Star,
    stockCount: 30,
  },
]

export function SelectWatchlist() {
  const [open, setOpen] = React.useState(false)
  const [selectedWatchlist, setSelectedWatchlist] = React.useState<BuiltInWatchlist | null>(null)

  const handleSelect = (watchlist: BuiltInWatchlist) => {
    setSelectedWatchlist(watchlist)
    setOpen(false)
  }

  return (
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
          <div className="flex flex-col gap-1">
            {builtInWatchlists.map((watchlist) => (
              <button
                key={watchlist.id}
                onClick={() => handleSelect(watchlist)}
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
                <div className="text-xs text-muted-foreground shrink-0">
                  {watchlist.stockCount} stocks
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

