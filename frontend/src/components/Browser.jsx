import { useState, useEffect } from 'react'

export default function Browser({ apiUrl, selectedAct, onActClick, onSectionClick, onBack }) {
  const [acts, setActs] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (selectedAct) {
      loadSections()
    } else {
      loadActs()
    }
  }, [apiUrl, selectedAct])

  const loadActs = () => {
    setLoading(true)
    fetch(`${apiUrl}/acts`)
      .then(res => res.json())
      .then(data => {
        setActs(data.acts.sort((a, b) => b.year.localeCompare(a.year)))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const loadSections = () => {
    setLoading(true)
    fetch(`${apiUrl}/sections?act_id=${selectedAct.id}`)
      .then(res => res.json())
      .then(data => {
        setSections(data.sections)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const filteredActs = acts.filter(act =>
    act.title.toLowerCase().includes(searchText.toLowerCase()) ||
    act.year.includes(searchText)
  )

  const filteredSections = sections.filter(section =>
    searchText === '' ||
    section.section_title.toLowerCase().includes(searchText.toLowerCase()) ||
    section.semantic_summary.toLowerCase().includes(searchText.toLowerCase()) ||
    section.section_number.includes(searchText)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Show Acts List
  if (!selectedAct) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{acts.length} Acts</h2>
            <div className="text-sm text-gray-600">{acts.reduce((sum, act) => sum + act.count, 0)} sections total</div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search acts by title or year..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredActs.map((act) => (
            <div
              key={act.id}
              onClick={() => onActClick(act)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border border-gray-200 hover:border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {act.year}
                    </span>
                    <span className="text-sm text-gray-500">Act {act.id}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {act.title}
                  </h3>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-3xl font-bold text-blue-600">{act.count || 0}</div>
                  <div className="text-xs text-gray-500">sections</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show Sections List for selected Act
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Acts
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {selectedAct.year}
          </span>
          <span className="text-sm text-gray-600">{sections.length} sections</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedAct.title}</h2>

        <div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search sections by title, number, or summary..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSections.map((section) => (
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

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {section.section_title}
            </h3>

            <p className="text-gray-700 mb-4 line-clamp-2">
              {section.semantic_summary}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {section.key_terms?.slice(0, 4).map((term, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {term}
                </span>
              ))}
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
              {section.amendments?.length > 0 && (
                <span>{section.amendments.length} amendment{section.amendments.length > 1 ? 's' : ''}</span>
              )}
              {section.external_references?.length > 0 && (
                <span>{section.external_references.length} reference{section.external_references.length > 1 ? 's' : ''}</span>
              )}
              <span>{section.word_count} words</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
