"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Command, 
  Home, 
  Send, 
  Star, 
  Trash2,
  Globe
} from "lucide-react"
import { NavUser } from "@/components/nav-user"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/app",
      icon: Home,
      isActive: false,
    },
    {
      title: "Watchlist",
      url: "/app/watchlist",
      icon: Star,
      isActive: true,
    },
    {
      title: "Sent",
      url: "/app/charting",
      icon: Send,
      isActive: false,
    },
    {
      title: "Markets",
      url: "#",
      icon: Globe,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const pathname = usePathname()
  
  // Sync activeItem with pathname
  React.useEffect(() => {
    const currentNavItem = data.navMain.find(item => item.url === pathname)
    if (currentNavItem) {
      setActiveItem(currentNavItem)
    } else if (pathname === "/app/charting") {
      const sentItem = data.navMain.find(item => item.title === "Sent")
      if (sentItem) {
        setActiveItem(sentItem)
      }
    }
  }, [pathname])

  return (
    <Sidebar
      collapsible="none"
      className="fixed left-0 top-0 h-screen bg-sidebar"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] h-full relative"
      >
        <SidebarHeader className="py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" asChild className="h-7 p-0 justify-center">
                <a href="#">
                  <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-3.5" />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="mx-0" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      asChild={item.url !== "#"}
                      onClick={() => {
                        if (item.url === "#") {
                          setActiveItem(item)
                        }
                      }}
                      isActive={activeItem.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      {item.url !== "#" ? (
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <>
                          <item.icon />
                          <span>{item.title}</span>
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="mx-0" />
        <SidebarFooter className="py-2">
          <NavUser user={data.user} />
        </SidebarFooter>
        {/* Vertical separator on the right */}
        <Separator orientation="vertical" className="absolute right-0 top-0 h-full" />
      </Sidebar>
    </Sidebar>
  )
}