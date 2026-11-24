const icons = {
  settings: <><path d="M4 7h9m4 0h3M4 17h3m4 0h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  back: <path d="M20 12H5m6 6-6-6 6-6" />,
  link: <><path d="M10 13.5a4 4 0 0 0 5.7.1l3.2-3.2a4 4 0 0 0-5.6-5.7l-1.8 1.8" /><path d="M14 10.5a4 4 0 0 0-5.7-.1l-3.2 3.2a4 4 0 0 0 5.6 5.7l1.8-1.8" /></>,
  sparkle: <path d="M10 3c.8 5.3 2.6 7.2 8 8-5.4.8-7.2 2.7-8 8-.8-5.3-2.6-7.2-8-8 5.4-.8 7.2-2.7 8-8Zm9 11v6m-3-3h6m-3-14v4m-2-2h4" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.2a4 4 0 0 1 0 7.6" /><circle cx="9" cy="7" r="4" /></>,
  eye: <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  reset: <><path d="M3 10a9 9 0 1 1 2 8m-2-8V4m0 6h6" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14a4.5 4.5 0 0 0 8 0M9 9h.01M15 9h.01" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19" /></>,
  moon: <path d="M20.8 13.4A9 9 0 0 1 10.6 3.2 9 9 0 1 0 20.8 13.4Z" />,
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9A2.5 2.5 0 1 1 13 11.3c-.7.4-1 1-1 1.7m0 3h.01" /></>,
  message: <path d="M20 11.5a8 8 0 0 1-8 8H4l1.2-4A8 8 0 1 1 20 11.5Z" />,
}

export function Icon({ name, size = 20 }: { name: keyof typeof icons; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}
