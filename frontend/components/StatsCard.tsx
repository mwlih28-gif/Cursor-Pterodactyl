'use client'

interface StatsCardProps {
  title: string
  value: number
  icon: string
  color?: 'accent' | 'success' | 'warning' | 'error'
}

export default function StatsCard({ title, value, icon, color = 'accent' }: StatsCardProps) {
  const colorClasses = {
    accent: 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9]',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
  }

  return (
    <div className={`bg-[#1e293b] rounded-lg border ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-75">{title}</div>
    </div>
  )
}
