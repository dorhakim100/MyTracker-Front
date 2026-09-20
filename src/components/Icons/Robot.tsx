export function Robot({ className }: { className?: string }) {
  return (
    <div className={`custom-svg-icon robot ${className}`}>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.5'
        >
          <rect
            x='4.5'
            y='6.75'
            width='15'
            height='14.25'
            rx='4'
          />
          <rect
            x='1.4'
            y='11.25'
            width='2.2'
            height='5.5'
            rx='1.1'
          />
          <rect
            x='20.4'
            y='11.25'
            width='2.2'
            height='5.5'
            rx='1.1'
          />
          <circle
            cx='12'
            cy='2.85'
            r='1.35'
          />
          <path d='M12 4.2V6.75' />
          <path d='M9.15 10.15L12 13.1L14.85 10.15' />
        </g>
        <circle
          cx='9.15'
          cy='16.15'
          r='1.15'
          fill='currentColor'
        />
        <circle
          cx='14.85'
          cy='16.15'
          r='1.15'
          fill='currentColor'
        />
      </svg>
    </div>
  )
}
