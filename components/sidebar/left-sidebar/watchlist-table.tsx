"use client"

import * as React from "react"
import { 
  Plus, 
  Settings, 
  Info, 
  Check, 
  X, 
  Flag,
  ArrowUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface StockData {
  symbol: string
  name?: string
  price: number
  changePercent: number
  dc: number
  dcStatus: boolean
  logo?: string
  flagged?: boolean
}

// Mock data based on the screenshot
const stockData: StockData[] = [
  { symbol: "WGS", price: 146.55, changePercent: 9.22, dc: 99, dcStatus: true },
  { symbol: "DAVE", price: 194.68, changePercent: 7.61, dc: 100, dcStatus: false },
  { symbol: "ZETA", price: 17.35, changePercent: 6.07, dc: 96, dcStatus: false },
  { symbol: "IDXX", price: 725.91, changePercent: 5.44, dc: 79, dcStatus: true },
  { symbol: "FSLY", price: 10.91, changePercent: 3.76, dc: 75, dcStatus: true },
  { symbol: "KTOS", price: 69.41, changePercent: 3.50, dc: 96, dcStatus: false },
  { symbol: "DELL", price: 123.21, changePercent: 3.36, dc: 88, dcStatus: false, flagged: true },
  { symbol: "SEDG", price: 34.64, changePercent: 3.35, dc: 74, dcStatus: false },
  { symbol: "ALAB", price: 141.80, changePercent: 2.31, dc: 84, dcStatus: false },
  { symbol: "SHOP", price: 148.00, changePercent: 2.23, dc: 73, dcStatus: false },
  { symbol: "TEL", price: 218.93, changePercent: 2.18, dc: 71, dcStatus: false },
  { symbol: "CRS", price: 309.06, changePercent: 2.17, dc: 100, dcStatus: false },
  { symbol: "RGTI", price: 23.81, changePercent: 1.99, dc: 98, dcStatus: false },
  { symbol: "MOD", price: 143.04, changePercent: 1.99, dc: 98, dcStatus: false },
]

export function WatchlistTable() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground w-full">
      {/* Header */}
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground border-b bg-muted/30 font-medium">
        <div className="w-8 flex items-center justify-center">
          <Checkbox className="size-3.5 border-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-1 flex-1 min-w-[80px]">
          <span>Symbol</span>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="w-20 text-right">Live Price</div>
        <div className="w-20 text-right flex items-center justify-end gap-1">
          <span className="text-blue-500 font-bold">1</span>
          <span>% Chang...</span>
          <ArrowUp className="h-3 w-3" />
        </div>
        <div className="w-16 flex items-center justify-end gap-1">
          <span>DC</span>
          <Info className="h-3 w-3" />
          <Settings className="h-3 w-3 ml-1" />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {stockData.map((stock) => (
            <div 
              key={stock.symbol} 
              className="flex items-center px-2 py-2 hover:bg-accent/50 cursor-pointer border-b border-border/40 text-sm group"
            >
              <div className="w-8 flex items-center justify-center">
                <Checkbox className="size-3.5 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-[80px]">
                <Avatar className="h-5 w-5 rounded-sm">
                  <AvatarImage src={`https://avatar.vercel.sh/${stock.symbol}.png`} alt={stock.symbol} />
                  <AvatarFallback className="rounded-sm text-[10px] bg-muted text-muted-foreground">
                    {stock.symbol.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-bold text-sm">{stock.symbol}</span>
                {stock.flagged && (
                  <Flag className="h-3 w-3 text-red-500 fill-red-500" />
                )}
              </div>

              <div className="w-20 text-right font-mono font-medium">
                ${stock.price.toFixed(2)}
              </div>

              <div className="w-20 text-right font-mono">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  stock.changePercent >= 0 
                    ? "text-green-500" 
                    : "text-red-500"
                )}>
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="w-16 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{stock.dc}%</span>
                {stock.dcStatus ? (
                  <Check className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

