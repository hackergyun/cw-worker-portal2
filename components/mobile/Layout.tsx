// components/Layout.tsx
"use client"

import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-gs-green text-white px-4 py-3 shadow-md flex items-center gap-2">
        {/* 로고 자리 */}
        <img src="/logo.png" alt="GS Caltex Logo" className="h-6" />
        <h1 className="text-lg font-bold">GS Caltex 교육 시스템</h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 py-6">{children}</main>

      {/* 푸터 */}
      <footer className="bg-gray-100 text-center py-3 text-sm text-gray-500">
        © {new Date().getFullYear()} GS Caltex
      </footer>
    </div>
  )
}
