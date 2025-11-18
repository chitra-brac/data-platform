import { useState, useEffect } from 'react'

export default function IntentBrowser({ apiUrl, intentName, onSectionClick, onBack }) {
  const [intent, setIntent] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntentSections()
  }, [apiUrl, intentName])

  const loadIntentSections = async () => {
    setLoading(true)
    try {
      // Get intent details
      const intentsRes = await fetch(`${apiUrl}/intents`)
      const intentsData = await intentsRes.json()
      const intentInfo = intentsData.intents.find(i => i.name === intentName)
      setIntent(intentInfo)

      // Get intent mappings to find section IDs
      const mappingsRes = await fetch(`${apiUrl}/intent-sections/${intentName}`)
      const mappingsData = await mappingsRes.json()

      setSections(mappingsData.sections || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!intent) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Intent category not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{intent.display}</h2>
            <p className="text-gray-600 mb-4">{intent.description}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{sections.length}</div>
            <div className="text-sm text-gray-500">sections</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            These are the key sections mapped to this legal topic. Think something is missing?
            Use the "Add to intent category" feature on any section to suggest additions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={`${section.act_id}-${section.section_number}`}
            onClick={() => onSectionClick(section)}
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border border-gray-200 hover:border-blue-400"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                  Section {section.section_number}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  section.status === 'active' ? 'bg-green-100 text-green-800' :
                  section.status === 'repealed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {section.status}
                </span>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-xs text-gray-500">{section.act_title}</span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {section.section_title}
            </h3>

            <p className="text-gray-700 mb-4 line-clamp-2">
              {section.semantic_summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {section.key_terms?.slice(0, 4).map((term, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {term}
                </span>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No sections mapped to this intent category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
