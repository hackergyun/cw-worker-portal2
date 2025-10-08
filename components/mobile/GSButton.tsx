// components/GSButton.tsx
"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface GSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger"
  children: ReactNode
}

export default function GSButton({
  variant = "primary",
  children,
  className,
  ...props
}: GSButtonProps) {
  const baseStyle =
    "px-5 py-3 rounded-xl font-semibold text-center transition-all duration-200"

  const variants = {
    primary:
      "bg-gs-green text-white hover:bg-green-700 active:scale-95 shadow",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 active:scale-95",
    danger:
      "bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow",
  }

  return (
    <button
      className={clsx(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
