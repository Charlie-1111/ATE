import React from 'react'
import { motion } from 'framer-motion'

export function GoldTeeth({ className = '' }) {
  const id = React.useId()
  return (
    <svg viewBox="0 0 140 80" className={`w-32 h-20 ${className}`}>
      <defs>
        <linearGradient id={`tg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id={`dg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0FFFF" />
          <stop offset="25%" stopColor="#00FFFF" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#E0FFFF" />
        </linearGradient>
        <filter id={`ts-${id}`}>
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id={`ds-${id}`}>
          <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      
      <rect x="8" y="8" width="124" height="64" rx="8" fill={`url(#tg-${id})`} stroke="#000" strokeWidth="4" filter={`url(#ts-${id})`} />
      
      {[22, 42, 62, 82, 102].map((x, i) => (
        <g key={i}>
          <rect x={x} y="16" width="16" height="48" rx="3" fill={`url(#tg-${id})`} stroke="#000" strokeWidth="2.5" filter={`url(#ts-${id})`} />
          <rect x={x + 3} y="20" width="4" height="38" rx="1" fill="#FFE55C" opacity="0.4" />
        </g>
      ))}
      
      {[[30, 13], [70, 13], [110, 13]].map(([cx, cy], i) => (
        <g key={`d${i}`} filter={`url(#ds-${id})`}>
          <polygon points={`${cx},${cy - 4} ${cx + 5},${cy} ${cx},${cy + 4} ${cx - 5},${cy}`} fill={`url(#dg-${id})`} stroke="#000" strokeWidth="1.5" />
          <line x1={cx} y1={cy - 4} x2={cx + 3} y2={cy + 2} stroke="#fff" strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
      
      <polygon points="70,64 78,56 86,64 78,72" fill={`url(#dg-${id})`} stroke="#000" strokeWidth="2" filter={`url(#ds-${id})`} />
      <line x1="74" y1="58" x2="82" y2="64" stroke="#fff" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function DiamondBracelet({ className = '' }) {
  const id = React.useId()
  return (
    <motion.svg
      viewBox="0 0 80 180"
      className={`w-16 h-36 ${className}`}
      animate={{ rotate: [-1, 1, -1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id={`sg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="30%" stopColor="#C0C0C0" />
          <stop offset="60%" stopColor="#A8A8A8" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
        <linearGradient id={`dg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0FFFF" />
          <stop offset="25%" stopColor="#00FFFF" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#E0FFFF" />
        </linearGradient>
        <filter id={`cs-${id}`}>
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id={`ds-${id}`}>
          <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      
      {[25, 55, 85, 115].map((cy, i) => {
        const grad = i % 2 === 0 ? `bg-${id}` : `sg-${id}`
        return (
          <g key={i} filter={`url(#cs-${id})`}>
            <ellipse cx="40" cy={cy} rx="24" ry="15" fill="none" stroke={`url(#${grad})`} strokeWidth="10" />
            <ellipse cx="40" cy={cy} rx="24" ry="15" fill="none" stroke="#000" strokeWidth="3" />
            <ellipse cx="40" cy={cy - 6} rx="16" ry="4" fill={i % 2 === 0 ? '#FFE55C' : '#F0F0F0'} opacity="0.3" />
          </g>
        )
      })}
      
      <g filter={`url(#ds-${id})`}>
        <polygon points="40,135 54,150 40,172 26,150" fill={`url(#dg-${id})`} stroke="#000" strokeWidth="3" />
        <polygon points="40,142 48,150 40,162 32,150" fill="#FFFFFF" opacity="0.5" />
        <line x1="40" y1="135" x2="48" y2="148" stroke="#fff" strokeWidth="1" opacity="0.6" />
        <circle cx="34" cy="145" r="1.5" fill="#fff" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </motion.svg>
  )
}

export function ChainVertical({ className = '', side = 'left' }) {
  const id = React.useId()
  const links = [20, 55, 90, 125, 160, 195]
  
  return (
    <motion.svg
      viewBox="0 0 30 220"
      className={`w-7 h-52 ${className}`}
      animate={{ rotate: side === 'left' ? [-0.5, 0.5, -0.5] : [0.5, -0.5, 0.5] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id={`clg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="20%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#B8860B" />
          <stop offset="80%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFE55C" />
        </linearGradient>
        <linearGradient id={`csg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="30%" stopColor="#C0C0C0" />
          <stop offset="60%" stopColor="#909090" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>
        <filter id={`cls-${id}`}>
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      
      {links.map((cy, i) => {
        const grad = i % 2 === 0 ? `clg-${id}` : `csg-${id}`
        return (
          <g key={i} filter={`url(#cls-${id})`}>
            <ellipse cx="15" cy={cy} rx="11" ry="17" fill="none" stroke={`url(#${grad})`} strokeWidth="7" />
            <ellipse cx="15" cy={cy} rx="11" ry="17" fill="none" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="12" cy={cy - 8} rx="5" ry="3" fill={i % 2 === 0 ? '#FFE55C' : '#F0F0F0'} opacity="0.35" />
          </g>
        )
      })}
      
      <g filter={`url(#cls-${id})`}>
        <polygon points="15,210 22,220 15,230 8,220" fill={`url(#dg-${id})`} stroke="#000" strokeWidth="2">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
        </polygon>
      </g>
    </motion.svg>
  )
}
