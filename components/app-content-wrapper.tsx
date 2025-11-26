"use client"

import * as React from "react"
import { DynamicHeader } from "@/components/dynamic-header"
import { SecondaryHeader } from "@/components/secondary-header"
import { SecondarySidebar } from "@/components/sidebar/secondary-sidebar"
import { ResizableContent } from "@/components/resizable-content"
import { SidebarInset } from "@/components/ui/sidebar"
import { type BuiltInWatchlist } from "@/components/watchlist/select-watchlist"

interface AppContentWrapperProps {
  children: React.ReactNode
}

export function AppContentWrapper({ children }: AppContentWrapperProps) {
  const [selectedWatchlist, setSelectedWatchlist] = React.useState<BuiltInWatchlist | null>(null)

  return (
    <>
      {/* Headers spanning across secondary sidebar, content, and watchlist */}
      <div className="fixed top-0 left-[calc(var(--sidebar-width-icon)_+_1px)] right-0 z-40 flex flex-col">
        <DynamicHeader />
        <SecondaryHeader onWatchlistChange={setSelectedWatchlist} />
      </div>
      {/* Secondary left sidebar - below headers */}
      <div className="hidden md:flex fixed left-[calc(var(--sidebar-width-icon)_+_1px)] top-[5.5rem] h-[calc(100vh-5.5rem)] w-[var(--secondary-sidebar-width)] border-r border-border bg-background z-30">
        <SecondarySidebar />
      </div>
      <SidebarInset className="ml-[calc(var(--sidebar-width-icon)_+_1px)] md:ml-[calc(var(--sidebar-width-icon)_+_var(--secondary-sidebar-width)_+_2px)] h-screen pt-[5.5rem] overflow-hidden">
        <ResizableContent selectedWatchlist={selectedWatchlist}>
          {children}
        </ResizableContent>
      </SidebarInset>
    </>
  )
}

