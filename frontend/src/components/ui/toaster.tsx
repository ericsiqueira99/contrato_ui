// components/ui/toaster.tsx

"use client"

import {
  Toaster,
  Toast,
  createToaster,
} from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const AppToaster = () => {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root width="sm">
          <Toast.Title>{toast.title}</Toast.Title>

          {toast.description && (
            <Toast.Description>
              {toast.description}
            </Toast.Description>
          )}
        </Toast.Root>
      )}
    </Toaster>
  )
}