"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WatchlistTable } from "@/components/sidebar/left-sidebar/watchlist-table"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { type BuiltInWatchlist } from "@/components/watchlist/select-watchlist"

interface ResizableContentProps {
  children: React.ReactNode
  selectedWatchlist?: BuiltInWatchlist | null
}

export function ResizableContent({ children, selectedWatchlist }: ResizableContentProps) {
  const [isLargeScreen, setIsLargeScreen] = React.useState(false)

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Render the watchlist content - either the selected component or default table
  const WatchlistContent = React.useMemo(() => {
    if (selectedWatchlist?.component) {
      const Component = selectedWatchlist.component
      return <Component />
    }
    return <WatchlistTable />
  }, [selectedWatchlist])

  // On small screens, just show content without resizable panels
  if (!isLargeScreen) {
    return (
      <ScrollArea className="h-full w-full">
        {children}
      </ScrollArea>
    )
  }

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="h-full"
      autoSaveId="main-layout"
    >
      {/* Main content panel */}
      <ResizablePanel defaultSize={70} minSize={30}>
        <ScrollArea className="h-full w-full">
          {children}
        </ScrollArea>
      </ResizablePanel>
      
      {/* Resize handle */}
      <ResizableHandle />
      
      {/* Watchlist panel */}
      <ResizablePanel 
        defaultSize={30} 
        minSize={15} 
        maxSize={50}
      >
        <div className="flex flex-col h-full w-full border-l border-border bg-background overflow-hidden">
          {WatchlistContent}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

