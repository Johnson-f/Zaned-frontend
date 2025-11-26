"use client"

import * as React from "react"
import { 
  Crosshair,
  Pencil,
  AlignJustify,
  Scissors,
  BarChart3,
  Link2,
  Type,
  Target,
  Eraser,
  ZoomIn,
  Wifi,
  Ruler,
  Lock,
  Eye,
  Trash2,
  Star,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const toolGroups = [
  {
    tools: [
      { icon: Crosshair, label: "Crosshair", id: "crosshair" },
      { icon: Pencil, label: "Draw Line", id: "line" },
      { icon: AlignJustify, label: "Horizontal Line", id: "horizontal" },
      { icon: Scissors, label: "Fibonacci", id: "fibonacci" },
      { icon: BarChart3, label: "Chart Pattern", id: "pattern" },
      { icon: Link2, label: "Measure", id: "measure" },
      { icon: Type, label: "Text", id: "text" },
      { icon: Target, label: "Price Alert", id: "alert" },
    ],
  },
  {
    tools: [
      { icon: Eraser, label: "Eraser", id: "eraser" },
      { icon: ZoomIn, label: "Zoom", id: "zoom" },
    ],
  },
  {
    tools: [
      { icon: Wifi, label: "Broadcast", id: "broadcast" },
      { icon: Ruler, label: "Measure Tool", id: "ruler" },
      { icon: Lock, label: "Lock Drawings", id: "lock" },
      { icon: Eye, label: "Show/Hide", id: "visibility" },
    ],
  },
  {
    tools: [
      { icon: Trash2, label: "Delete All", id: "delete" },
    ],
  },
]

const bottomTools = [
  { icon: Star, label: "Favorites", id: "favorites" },
  { icon: Settings, label: "Settings", id: "settings" },
]

export function SecondarySidebar() {
  const [activeTool, setActiveTool] = React.useState<string>("crosshair")

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full w-full bg-background">
        <ScrollArea className="flex-1">
          <div className="flex flex-col items-center py-2 gap-1">
            {toolGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {group.tools.map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent",
                          activeTool === tool.id && "bg-accent text-foreground"
                        )}
                        onClick={() => setActiveTool(tool.id)}
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {tool.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {groupIndex < toolGroups.length - 1 && (
                  <Separator className="my-1 w-6" />
                )}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        
        {/* Bottom tools */}
        <div className="flex flex-col items-center py-2 gap-1 border-t border-border">
          {bottomTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {tool.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

