import { useState } from 'react'

export default function SectionDetail({ section, onBack, apiUrl = 'http://localhost:8000' }) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!section) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No section selected</p>
      </div>
    )
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          section_id: `${section.act_id}-${section.section_number}`,
          organization: feedback.organization || null
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setFeedback({ name: '', email: '', message: '', organization: '' })
        setTimeout(() => {
          setSubmitted(false)
          setShowFeedback(false)
        }, 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Sections
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                  {section.year}
                </span>
                <span className="text-sm text-gray-500">Act {section.act_id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  section.status === 'active' ? 'bg-green-100 text-green-800' :
                  section.status === 'repealed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {section.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Section {section.section_number}
              </h1>
              <h2 className="text-xl text-gray-700 mb-3">{section.section_title}</h2>
            </div>
          </div>
          <p className="text-gray-600">{section.act_title}</p>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Plain Language Summary</h3>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-800 leading-relaxed">{section.semantic_summary}</p>
          </div>
        </div>

        {/* Key Terms */}
        {section.key_terms && section.key_terms.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Terms</h3>
            <div className="flex flex-wrap gap-2">
              {section.key_terms.map((term, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full Text */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Legal Text</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-bengali">
              {section.section_text}
            </p>
          </div>
        </div>

        {/* Amendments */}
        {section.amendments && section.amendments.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Amendments ({section.amendments.length})
            </h3>
            <div className="space-y-3">
              {section.amendments.map((amendment, idx) => (
                <div key={idx} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <div className="flex gap-4 text-sm mb-2">
                    <span className="font-semibold text-orange-800">
                      {amendment.year}
                    </span>
                    <span className="text-gray-600 capitalize">{amendment.type}</span>
                  </div>
                  <p className="text-gray-700">{amendment.full_text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500 italic">
              Know of missing amendments? Please share via feedback below.
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Amendments</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                No amendment data available for this section.
              </p>
              <p className="text-xs text-orange-600 mt-2">
                💡 If you know of amendments to this section, please share via feedback below!
              </p>
            </div>
          </div>
        )}

        {/* External References */}
        {section.external_references && section.external_references.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              External References ({section.external_references.length})
            </h3>
            <div className="space-y-2">
              {section.external_references.map((ref, idx) => (
                <div key={idx} className="bg-purple-50 p-4 rounded border border-purple-200">
                  <div className="font-medium text-purple-900">
                    Act {ref.referenced_act_id}
                    {ref.referenced_sections && ` - Sections: ${ref.referenced_sections.join(', ')}`}
                  </div>
                  {ref.context && (
                    <p className="text-sm text-gray-700 mt-2">{ref.context}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t pt-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-1">Word Count</div>
              <div className="text-lg font-bold text-gray-900">{section.word_count}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-1">Character Count</div>
              <div className="text-lg font-bold text-gray-900">{section.char_count}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-1">Amendments</div>
              <div className="text-lg font-bold text-gray-900">{section.amendments?.length || 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-1">References</div>
              <div className="text-lg font-bold text-gray-900">{section.external_references?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="border-t pt-6">
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition"
            >
              💬 Have feedback on this section? Click to share
            </button>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-600 text-5xl mb-3">✓</div>
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Thank You!</h4>
                  <p className="text-green-700">Your feedback has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Your email (optional)"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Your feedback (corrections, suggestions, etc.)"
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !feedback.message}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
