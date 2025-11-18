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

  const topActs = stats.acts?.slice(0, 10) || []

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Sections</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.total_sections}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Acts</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.total_acts}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">With Amendments</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">{stats.with_amendments}</div>
          <div className="text-xs text-orange-600 mt-1 font-medium">
            {((stats.with_amendments / stats.total_sections) * 100).toFixed(1)}% coverage (incomplete)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Help us improve! Share missing amendments via feedback.
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Intent Categories</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.intent_categories}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Section Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Acts by Section Count */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Acts by Section Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topActs} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="year" width={50} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intent Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Intent Categories ({intents.length} legal topics)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intents.map((intent, idx) => (
            <div key={intent.name} className="border rounded-lg p-4 hover:shadow-md transition hover:border-blue-400">
              <div className="text-sm font-semibold text-gray-900 mb-1">{intent.display}</div>
              <div className="text-xs text-gray-600 mb-3 line-clamp-2">{intent.description}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-blue-600">{intent.count}</div>
                <div className="text-xs text-gray-500">key sections</div>
              </div>
            </div>
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
