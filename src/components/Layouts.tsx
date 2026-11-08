import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { ToastProvider } from './Toast'

/** Phone-width column, centered on larger screens. */
export function RootLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <ToastProvider>
      <div className="mx-auto min-h-dvh w-full max-w-md bg-bg sm:border-x-2 sm:border-line">
        <Outlet />
      </div>
    </ToastProvider>
  )
}

/** Pages that show the bottom tab bar. */
export function TabsLayout() {
  return (
    <>
      <div className="pb-32">
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}

/** Task screens (capture, forms) that take over the whole screen. */
export function FocusLayout() {
  return <Outlet />
}
