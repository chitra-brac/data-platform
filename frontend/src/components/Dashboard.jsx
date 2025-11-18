import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Dashboard({ stats, apiUrl }) {
  const [intents, setIntents] = useState([])

  useEffect(() => {
    fetch(`${apiUrl}/intents`)
      .then(res => res.json())
      .then(data => setIntents(data.intents))
      .catch(err => console.error(err))
  }, [apiUrl])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    )
  }

  const statusData = Object.entries(stats.status || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  // Data completeness by type
  const completenessData = [
    { name: 'Summaries', value: 100, color: '#10B981' },
    { name: 'Key Terms', value: 100, color: '#10B981' },
    { name: 'References', value: ((stats.with_references / stats.total_sections) * 100).toFixed(1), color: '#F59E0B' },
    { name: 'Amendments', value: ((stats.with_amendments / stats.total_sections) * 100).toFixed(1), color: '#EF4444' },
  ]

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Sections</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.total_sections}</div>
          <div className="text-xs text-gray-500 mt-1">from {stats.total_acts} acts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">AI Summaries</div>
          <div className="text-3xl font-bold text-green-600 mt-2">100%</div>
          <div className="text-xs text-gray-500 mt-1">all sections covered</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Amendments</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">{((stats.with_amendments / stats.total_sections) * 100).toFixed(1)}%</div>
          <div className="text-xs text-orange-600 mt-1 font-medium">
            incomplete - help us improve!
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Active Sections</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.status?.active || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((stats.status?.active / stats.total_sections) * 100).toFixed(0)}% of total
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Completeness */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Data Completeness</h3>
          <div className="space-y-4">
            {completenessData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            Use feedback forms to help improve amendment and reference coverage
          </p>
        </div>

        {/* Section Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Section Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'active' ? 'bg-green-500' :
                    status === 'repealed' ? 'bg-red-500' :
                    status === 'omitted' ? 'bg-gray-500' :
                    'bg-orange-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500">
                    {((count / stats.total_sections) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intent Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Intent Categories ({intents.length} legal topics)</h3>
        <p className="text-sm text-gray-600 mb-4">Click any category to see which sections are mapped to it</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intents.map((intent, idx) => (
            <button
              key={intent.name}
              onClick={() => window.location.hash = `intent-${intent.name}`}
              className="border rounded-lg p-4 hover:shadow-md transition hover:border-blue-400 text-left"
            >
              <div className="text-sm font-semibold text-gray-900 mb-1">{intent.display}</div>
              <div className="text-xs text-gray-600 mb-3 line-clamp-2">{intent.description}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-blue-600">{intent.count}</div>
                <div className="text-xs text-gray-500">key sections →</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Acts List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Acts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sections
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.acts?.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {act.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {act.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {act.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
