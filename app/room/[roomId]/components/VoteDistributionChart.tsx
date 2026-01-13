'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CHART_COLORS } from '../../../constants'

interface VoteDistributionChartProps {
  voteDistribution: Array<{ name: string; value: number }>
}

export function VoteDistributionChart({ voteDistribution }: VoteDistributionChartProps) {
  if (voteDistribution.length === 0) return null

  return (
    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
      <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Vote Distribution:</p>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={voteDistribution}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(props: { name?: string; value?: number }) => {
              if (!props.name || props.value === undefined) return ''
              const total = voteDistribution.reduce((sum, item) => sum + item.value, 0)
              const percentage = total > 0 ? Math.round((props.value / total) * 100) : 0
              return `${props.name} (${percentage}%)`
            }}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {voteDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={(props: { active?: boolean; payload?: ReadonlyArray<{ name?: string; value?: number }> }) => {
              if (props.active && props.payload && props.payload.length) {
                const data = props.payload[0]
                if (data.name !== undefined && data.value !== undefined) {
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {`${data.name}: ${data.value} vote${data.value > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  )
                }
              }
              return null
            }}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '12px',
              color: 'inherit'
            }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
