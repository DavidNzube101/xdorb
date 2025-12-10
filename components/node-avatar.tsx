"use client"

import { HardDrive } from "lucide-react"

interface NodeAvatarProps {
  id: string
  name: string
  size?: "sm" | "md" | "lg"
}

export function NodeAvatar({ id, name, size = "md" }: NodeAvatarProps) {
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

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-gray-200 text-gray-600 ${sizeClasses[size]}`}
      title={name}
    >
      <HardDrive size={iconSizes[size]} />
    </div>
  )
}