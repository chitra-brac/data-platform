import { useState, useEffect } from 'react'

export default function SectionDetail({ section, onBack, apiUrl = 'http://localhost:8000', prevSection, nextSection, onNavigate, act }) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showIntents, setShowIntents] = useState(false)
  const [intents, setIntents] = useState([])
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Load intents
    fetch(`${apiUrl}/intents`)
      .then(res => res.json())
      .then(data => setIntents(data.intents))
      .catch(err => console.error(err))
  }, [apiUrl])

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={onBack}
          className="hover:text-blue-600 transition"
        >
          {section.act_title}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Section {section.section_number}</span>
      </div>

      {/* Section Navigation */}
      {(prevSection || nextSection) && (
        <div className="flex justify-between items-center bg-white rounded-lg shadow px-4 py-3">
          <button
            onClick={() => prevSection && onNavigate(prevSection)}
            disabled={!prevSection}
            className={`flex items-center gap-2 text-sm font-medium ${
              prevSection
                ? 'text-blue-600 hover:text-blue-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>←</span>
            <span>{prevSection ? `Section ${prevSection.section_number}` : 'No previous'}</span>
          </button>
          <div className="text-xs text-gray-500">Navigate sections</div>
          <button
            onClick={() => nextSection && onNavigate(nextSection)}
            disabled={!nextSection}
            className={`flex items-center gap-2 text-sm font-medium ${
              nextSection
                ? 'text-blue-600 hover:text-blue-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{nextSection ? `Section ${nextSection.section_number}` : 'No next'}</span>
            <span>→</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
        {/* Header - minimal metadata */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          <span>{section.year}</span>
          <span>•</span>
          <span>Act {section.act_id}</span>
          {section.status !== 'active' && (
            <>
              <span>•</span>
              <span className="text-red-600">{section.status}</span>
            </>
          )}
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {section.section_number}
          </h1>
          <h2 className="text-2xl text-gray-700 mb-6">{section.section_title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-gray-300 pl-4">
            {section.semantic_summary}
          </p>
        </div>

        {/* Full Text - most important */}
        <div className="mb-12">
          <p className="text-base text-gray-900 whitespace-pre-wrap leading-loose">
            {section.section_text}
          </p>
        </div>

        {/* Amendments - only if exist */}
        {section.amendments && section.amendments.length > 0 && (
          <div className="mb-10 border-t pt-8">
            <div className="text-sm font-semibold text-gray-700 mb-4">
              Amendments
            </div>
            <div className="space-y-4">
              {section.amendments.map((amendment, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-orange-400">
                  <div className="text-sm text-gray-500 mb-1">
                    {amendment.year} • {amendment.type}
                  </div>
                  <p className="text-gray-700">{amendment.full_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References - only if exist */}
        {section.external_references && section.external_references.length > 0 && (
          <div className="mb-10 border-t pt-8">
            <div className="text-sm font-semibold text-gray-700 mb-4">
              References
            </div>
            <div className="space-y-3">
              {section.external_references.map((ref, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-gray-900">
                    Act {ref.referenced_act_id}
                    {ref.referenced_sections && ` § ${ref.referenced_sections.join(', ')}`}
                  </span>
                  {ref.context && (
                    <span className="text-gray-600"> — {ref.context}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key terms - compact at bottom */}
        {section.key_terms && section.key_terms.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {section.key_terms.map((term, idx) => (
                <span key={idx}>{term}</span>
              )).reduce((prev, curr) => [prev, ' • ', curr])}
            </div>
          </div>
        )}

        {/* Add to Intent Category */}
        <div className="border-t pt-6 mb-6">
          {!showIntents ? (
            <button
              onClick={() => setShowIntents(true)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + Add to intent category
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Select Intent Category</h3>
                <button
                  onClick={() => setShowIntents(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {intents.map((intent) => (
                  <button
                    key={intent.name}
                    onClick={() => {
                      setFeedback({
                        ...feedback,
                        message: `Suggest adding this section to intent category: "${intent.display}"\n\nReason: `
                      })
                      setShowIntents(false)
                      setShowFeedback(true)
                    }}
                    className="p-3 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-100 transition text-left"
                  >
                    <div className="font-medium text-sm text-gray-900">{intent.display}</div>
                    <div className="text-xs text-gray-500 mt-1">{intent.count} sections</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="border-t pt-6">
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add feedback
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Feedback</h3>
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
