"use client"

import {
  Separator,
} from "@/components/ui/separator"
import { SymbolSearch } from "@/components/symbol-search"

export function DynamicHeader() {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <div className="px-3">
        <SymbolSearch />
      </div>
    </header>
  )
}
