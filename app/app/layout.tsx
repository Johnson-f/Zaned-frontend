import type React from "react"
import { SidebarLeft } from "@/components/sidebar-left"
import { SidebarRight } from "@/components/sidebar-right"
import { DynamicHeader } from "@/components/dynamic-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <DynamicHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto max-w-full">{children}</div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  )
}
