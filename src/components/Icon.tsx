import type { ReactNode, SVGProps } from 'react'

const paths: Record<string, ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </>
  ),
  chart: <path d="M6 20v-8M12 20V4M18 20V9" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  heart: <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4z" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v12H4z" />
      <circle cx="12" cy="14" r="3.5" />
    </>
  ),
  check: <path d="M5 12l5 5 9-10" />,
  sliders: (
    <>
      <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="9" cy="17" r="2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  chevron: <path d="M9 5l7 7-7 7" />,
}

export type IconName = keyof typeof paths

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  filled?: boolean
}

export function Icon({ name, size = 24, filled = false, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
