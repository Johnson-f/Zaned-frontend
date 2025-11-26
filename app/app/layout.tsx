import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppContentWrapper } from "@/components/app-content-wrapper"

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
      <AppContentWrapper>
          {children}
      </AppContentWrapper>
    </SidebarProvider>
  )
}