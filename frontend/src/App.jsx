import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Browser from './components/Browser'
import SectionDetail from './components/SectionDetail'
import IntentBrowser from './components/IntentBrowser'

const API_URL = 'http://localhost:8000'

function App() {
  const [view, setView] = useState('dashboard')
  const [selectedAct, setSelectedAct] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedIntent, setSelectedIntent] = useState(null)
  const [stats, setStats] = useState(null)
  const [actSections, setActSections] = useState([])

  useEffect(() => {
    // Load stats on mount
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))

    // Check for intent hash in URL
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#intent-')) {
        const intentName = hash.replace('#intent-', '')
        setSelectedIntent(intentName)
        setView('intent')
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Load sections for navigation when viewing a section detail
  useEffect(() => {
    if (selectedSection && selectedSection.act_id) {
      fetch(`${API_URL}/sections?act_id=${selectedSection.act_id}`)
        .then(res => res.json())
        .then(data => setActSections(data.sections || []))
        .catch(err => console.error('Failed to load act sections:', err))
    }
  }, [selectedSection])

  const handleActClick = (act) => {
    setSelectedAct(act)
    setView('sections')
  }

  const handleSectionClick = (section) => {
    setSelectedSection(section)
    setView('detail')
  }

  const handleBackToActs = () => {
    setSelectedAct(null)
    setView('browse')
  }

  const handleBackToSections = () => {
    setSelectedSection(null)
    setView('sections')
  }

  const handleBackToDashboard = () => {
    setSelectedIntent(null)
    setView('dashboard')
    window.location.hash = ''
  }

  // Calculate prev/next sections for navigation
  const currentIndex = actSections.findIndex(
    s => s.act_id === selectedSection?.act_id && s.section_number === selectedSection?.section_number
  )
  const prevSection = currentIndex > 0 ? actSections[currentIndex - 1] : null
  const nextSection = currentIndex >= 0 && currentIndex < actSections.length - 1 ? actSections[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Bangladesh Legal Knowledge Base</h1>
          <p className="text-blue-100 mt-1">AI Training Data Platform • Family Law Dataset</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setView('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                view === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Data Overview
            </button>
            <button
              onClick={() => {
                setView('browse')
                setSelectedAct(null)
                setSelectedSection(null)
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                view === 'browse' || view === 'sections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🗂️ Dataset Explorer
            </button>
          </div>
        </div>
      </nav>

      {/* WIP Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="container mx-auto px-4 py-2">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Test Platform</strong> • This is a work-in-progress data curation tool for internal review
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' && <Dashboard stats={stats} apiUrl={API_URL} />}
        {view === 'browse' && <Browser apiUrl={API_URL} onActClick={handleActClick} />}
        {view === 'sections' && <Browser apiUrl={API_URL} selectedAct={selectedAct} onSectionClick={handleSectionClick} onBack={handleBackToActs} />}
        {view === 'intent' && <IntentBrowser apiUrl={API_URL} intentName={selectedIntent} onSectionClick={handleSectionClick} onBack={handleBackToDashboard} />}
        {view === 'detail' && <SectionDetail
          section={selectedSection}
          onBack={handleBackToSections}
          apiUrl={API_URL}
          prevSection={prevSection}
          nextSection={nextSection}
          onNavigate={handleSectionClick}
          act={selectedAct}
        />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm">
              Bangladesh Family Law Dataset • {stats?.total_sections || 0} Sections • {stats?.total_acts || 0} Acts
            </p>
            <p className="text-xs text-gray-400 mt-2">
              By Chitra (Shojeb & Sajid) • Data from bdlaws.minlaw.gov.bd
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
