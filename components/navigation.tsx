"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings } from "lucide-react" // Shield 아이콘 import 제거

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "작업자 등록", icon: Home },
    { href: "/admin", label: "관리자", icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-lg border-b-4 border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 영역 */}
          <Link href="/" className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">GS칼텍스</h1>
              <p className="text-sm text-gray-600">창원물류센터</p>
            </div>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* 모바일 메뉴 */}
          <div className="md:hidden flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
