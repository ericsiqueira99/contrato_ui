// components/ui/app-toast.ts

import { toaster } from "./toaster"

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"

interface ShowToastProps {
  type?: ToastType
  title: string
  description?: string
}

export function showToast({
  type = "info",
  title,
  description,
}: ShowToastProps) {
  toaster.create({
    type,
    title,
    description,
    duration: 3000,
    closable: true,
  })
}