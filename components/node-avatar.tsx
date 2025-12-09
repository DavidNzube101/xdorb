"use client"

import { generateAvatar } from "@/lib/utils"
import { HardDrive } from "lucide-react"

interface NodeAvatarProps {
  id: string
  name: string
  size?: "sm" | "md" | "lg"
  variant?: "initials" | "server"
}

export function NodeAvatar({ id, name, size = "md", variant = "initials" }: NodeAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  if (variant === "server") {
    return (
      <div
        className={`rounded-full flex items-center justify-center bg-gray-200 text-gray-600 ${sizeClasses[size]}`}
        title={name}
      >
        <HardDrive size={iconSizes[size]} />
      </div>
    )
  }

  // Default initials variant
  const { bgColor, initials } = generateAvatar(id)

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  )
}