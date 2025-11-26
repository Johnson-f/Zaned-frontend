import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DynamicHeader } from "@/components/dynamic-header"
import { SecondarySidebar } from "@/components/sidebar/secondary-sidebar"
import { ResizableContent } from "@/components/resizable-content"
import { SecondaryHeader } from "@/components/secondary-header"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
          "--sidebar-width-icon": "3rem",
          "--secondary-sidebar-width": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {/* Headers spanning across secondary sidebar, content, and watchlist */}
      <div className="fixed top-0 left-[calc(var(--sidebar-width-icon)_+_1px)] right-0 z-40 flex flex-col">
        <DynamicHeader />
        <SecondaryHeader />
      </div>
      {/* Secondary left sidebar - below headers */}
      <div className="hidden md:flex fixed left-[calc(var(--sidebar-width-icon)_+_1px)] top-[5.5rem] h-[calc(100vh-5.5rem)] w-[var(--secondary-sidebar-width)] border-r border-border bg-background z-30">
        <SecondarySidebar />
      </div>
      <SidebarInset className="ml-[calc(var(--sidebar-width-icon)_+_1px)] md:ml-[calc(var(--sidebar-width-icon)_+_var(--secondary-sidebar-width)_+_2px)] h-screen pt-[5.5rem] overflow-hidden">
        <ResizableContent>
          {children}
        </ResizableContent>
      </SidebarInset>
    </SidebarProvider>
  )
}