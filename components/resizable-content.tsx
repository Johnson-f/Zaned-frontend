"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WatchlistTable } from "@/components/sidebar/left-sidebar/watchlist-table"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

interface ResizableContentProps {
  children: React.ReactNode
}

export function ResizableContent({ children }: ResizableContentProps) {
  const [isLargeScreen, setIsLargeScreen] = React.useState(false)

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

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
          <WatchlistTable />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

