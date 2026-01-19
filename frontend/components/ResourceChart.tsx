'use client'

import { useEffect, useState } from 'react'

interface ResourceChartProps {
  title: string
  type: 'cpu' | 'memory' | 'network'
}

export default function ResourceChart({ title, type }: ResourceChartProps) {
  const [data, setData] = useState<number[]>([])

  useEffect(() => {
    // Mock data generation
    const interval = setInterval(() => {
      const newValue = Math.random() * 100
      setData(prev => [...prev.slice(-19), newValue])
    }, 2000)

    // Initialize with some data
    setData(Array(20).fill(0).map(() => Math.random() * 100))

    return () => clearInterval(interval)
  }, [type])

  const maxValue = Math.max(...data, 100)
  const minValue = Math.min(...data, 0)

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`${
                type === 'cpu' ? '#0ea5e9' : type === 'memory' ? '#10b981' : '#f59e0b'
              }`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`${
                type === 'cpu' ? '#0ea5e9' : type === 'memory' ? '#10b981' : '#f59e0b'
              }`} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 200
              const y = 100 - ((value / maxValue) * 100)
              return `${x},${y}`
            }).join(' ')}
            fill={`url(#gradient-${type})`}
            stroke={`${type === 'cpu' ? '#0ea5e9' : type === 'memory' ? '#10b981' : '#f59e0b'}`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>Min: {minValue.toFixed(1)}%</span>
        <span className="text-white font-semibold">
          Current: {data[data.length - 1]?.toFixed(1) || 0}%
        </span>
        <span>Max: {maxValue.toFixed(1)}%</span>
      </div>
    </div>
  )
}
