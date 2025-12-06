import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Analysis() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('text')
  const [regulationText, setRegulationText] = useState('')
  const [dateOfLaw, setDateOfLaw] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [visibleCards, setVisibleCards] = useState(new Set())
  
  const resultsRef = useRef(null)

  const API_URL = 'http://localhost:8000'

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.dataset.cardId
            if (cardId) {
              setVisibleCards((prev) => new Set([...prev, cardId]))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = document.querySelectorAll('[data-card-id]')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [result])

  // Smooth scroll to results
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [result])

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setVisibleCards(new Set())

    try {
      const response = await fetch(`${API_URL}/analyze_regulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_regulation_text: regulationText,
          date_of_law: dateOfLaw || null
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePdfSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setVisibleCards(new Set())

    const formData = new FormData()
    formData.append('file', pdfFile)
    if (dateOfLaw) {
      formData.append('date_of_law', dateOfLaw)
    }

    try {
      const response = await fetch(`${API_URL}/analyze_regulation_pdf`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = () => {
    if (!result) return
    
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compliance_report_${result.regulation_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleViewJSON = () => {
    if (!result) return
    navigate('/json-viewer', { state: { jsonData: result } })
  }

  const sortedRisks = result ? [...result.risks].sort((a, b) => {
    const severityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  }) : []

  return (
    <div 
      className="min-h-screen overflow-x-hidden" 
      style={{ 
        backgroundColor: '#e6dfd7',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Custom scrollbar styles */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Transparent Header */}
      <header 
        className="flex justify-between items-center px-12 py-4 transition-all duration-700 ease-out"
        style={{
          opacity: isPageLoaded ? 1 : 0,
          transform: isPageLoaded ? 'translateY(0)' : 'translateY(-20px)'
        }}
      >
        <div 
          onClick={() => navigate('/')}
          className="cursor-pointer"
        >
          <img 
            src="/images/lexia_Logo.png" 
            alt="Lexia Logo" 
            className="h-16 transition-transform duration-500 ease-in-out"
            style={{ transformStyle: 'preserve-3d' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(45deg)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
          />
        </div>

        {result && (
          <div 
            className="flex gap-3 transition-all duration-500 ease-out"
            style={{
              opacity: isPageLoaded ? 1 : 0,
              transform: isPageLoaded ? 'translateX(0)' : 'translateX(50px)'
            }}
          >
            <button
              onClick={handleViewJSON}
              className="flex items-center gap-2 px-6 py-2 bg-black rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <img 
                src="/images/lexia_icon.png" 
                alt="Icon" 
                className="h-5 w-5"
              />
              <span 
                style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }} 
                className="text-base font-semibold"
              >
                View JSON
              </span>
            </button>
            
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-6 py-2 bg-black rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <img 
                src="/images/lexia_icon.png" 
                alt="Icon" 
                className="h-5 w-5"
              />
              <span 
                style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }} 
                className="text-base font-semibold"
              >
                Export JSON
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section 
        className="max-w-7xl mx-auto px-12 py-8 transition-all duration-1000 ease-out"
        style={{
          opacity: isPageLoaded ? 1 : 0,
          transform: isPageLoaded ? 'scale(1)' : 'scale(0.95)',
          transitionDelay: '0.1s'
        }}
      >
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-12">
              <h1 
                className="text-5xl font-bold leading-tight mb-4"
                style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
              >
                Regulatory Compliance Analysis
              </h1>
              
              <p 
                className="text-xl text-gray-700 leading-relaxed mb-6"
                style={{ fontFamily: "'Cooper BT', serif" }}
              >
                Upload your regulation document and let our AI agents analyze potential conflicts with your internal policies in seconds.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">⚡</span>
                  <span className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Cooper BT', serif" }}>
                    Fast Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  <span className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Cooper BT', serif" }}>
                    Accurate Results
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-8" style={{ backgroundColor: '#c1a673' }}>
              <img 
                src="/images/hero_pic3.png" 
                alt="Analysis Hero" 
                className="w-full max-w-md object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-8">
        {/* Input Section */}
        <div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-1000 ease-out"
          style={{
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'translateY(0)' : 'translateY(50px)',
            transitionDelay: '0.2s'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="/images/lexia_icon.png" 
              alt="Icon" 
              className="h-10 w-10"
            />
            <h2 
              className="text-3xl font-bold"
              style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
            >
              Submit New Regulation
            </h2>
          </div>

          <div className="flex space-x-4 mb-6 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-2 px-4 font-semibold transition-all duration-300 ${
                activeTab === 'text'
                  ? 'border-b-4 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
              style={{ 
                fontFamily: "'Cooper BT', serif",
                color: activeTab === 'text' ? '#c1a673' : undefined
              }}
            >
              ✍️ Text Input
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`pb-2 px-4 font-semibold transition-all duration-300 ${
                activeTab === 'pdf'
                  ? 'border-b-4 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
              style={{ 
                fontFamily: "'Cooper BT', serif",
                color: activeTab === 'pdf' ? '#c1a673' : undefined
              }}
            >
              📎 PDF Upload
            </button>
          </div>

          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label 
                  className="block text-base font-semibold mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                >
                  <span>📄</span> Regulation Text *
                </label>
                <div className="relative">
                  <textarea
                    value={regulationText}
                    onChange={(e) => setRegulationText(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                    style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                    rows="10"
                    placeholder="Enter the full text of the regulation you want to analyze..."
                    required
                    minLength={50}
                    maxLength={10000}
                  />
                  <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
                    <p className="text-xs font-semibold" style={{ color: '#c1a673' }}>
                      {regulationText.length} / 2,000
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label 
                  className="block text-base font-semibold mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                >
                  <span>📅</span> Effective Date (Optional)
                </label>
                <input
                  type="date"
                  value={dateOfLaw}
                  onChange={(e) => setDateOfLaw(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                  style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-black rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <img 
                  src="/images/lexia_icon.png" 
                  alt="Icon" 
                  className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-12"
                />
                <span 
                  style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }} 
                  className="text-lg font-semibold"
                >
                  {loading ? '⏳ Analyzing...' : '🚀 Start Analysis'}
                </span>
              </button>
            </form>
          )}

          {activeTab === 'pdf' && (
            <form onSubmit={handlePdfSubmit} className="space-y-4">
              <div>
                <label 
                  className="block text-base font-semibold mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                >
                  <span>📁</span> Upload PDF File *
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-black transition-all" style={{ backgroundColor: '#fafafa' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="text-center">
                    <p className="text-4xl mb-2">📤</p>
                    <p className="text-base font-semibold" style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}>
                      {pdfFile ? pdfFile.name : 'Click or drag file to upload'}
                    </p>
                    {pdfFile && (
                      <p className="text-sm mt-1" style={{ color: '#c1a673' }}>
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label 
                  className="block text-base font-semibold mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                >
                  <span>📅</span> Effective Date (Optional)
                </label>
                <input
                  type="date"
                  value={dateOfLaw}
                  onChange={(e) => setDateOfLaw(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                  style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !pdfFile}
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-black rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <img 
                  src="/images/lexia_icon.png" 
                  alt="Icon" 
                  className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-12"
                />
                <span 
                  style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }} 
                  className="text-lg font-semibold"
                >
                  {loading ? '⏳ Analyzing...' : '🚀 Start Analysis'}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <img 
                src="/images/lexia_icon.png" 
                alt="Loading" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12"
              />
            </div>
            <p 
              className="mt-6 text-2xl font-bold"
              style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
            >
              Analyzing Regulation...
            </p>
            <p 
              className="mt-2 text-base text-gray-600"
              style={{ fontFamily: "'Cooper BT', serif" }}
            >
              This may take 15-30 seconds
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div 
            className="bg-red-50 border-l-4 border-red-600 rounded-xl p-4 mb-8 shadow-md animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 
                  className="text-xl font-bold text-red-800 mb-1"
                  style={{ fontFamily: "'Cooper BT', serif" }}
                >
                  Error Occurred
                </h3>
                <p 
                  className="text-base text-red-700"
                  style={{ fontFamily: "'Cooper BT', serif" }}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div ref={resultsRef} className="space-y-8">
            {/* Hero Section with Stats */}
            <div 
              data-card-id="stats-hero"
              className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden transition-all duration-1000 ease-out"
              style={{
                opacity: visibleCards.has('stats-hero') ? 1 : 0,
                transform: visibleCards.has('stats-hero') ? 'translateY(0)' : 'translateY(50px)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8">
                  <h2 
                    className="text-4xl font-bold mb-4"
                    style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                  >
                    Analysis Complete
                  </h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🆔</span>
                      <div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "'Cooper BT', serif" }}>
                          Regulation ID
                        </p>
                        <p className="text-base font-bold" style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}>
                          {result.regulation_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⏰</span>
                      <div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "'Cooper BT', serif" }}>
                          Processed
                        </p>
                        <p className="text-base font-bold" style={{ fontFamily: "'Cooper BT', serif" }}>
                          {result.date_processed} at {result.time_processed}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold opacity-90" style={{ fontFamily: "'Cooper BT', serif" }}>
                            HIGH Risk
                          </p>
                          <p className="text-5xl font-bold" style={{ fontFamily: "'Cooper BT', serif" }}>
                            {result.risk_breakdown.HIGH}
                          </p>
                        </div>
                        <span className="text-5xl">⛔</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold opacity-90" style={{ fontFamily: "'Cooper BT', serif" }}>
                            MEDIUM Risk
                          </p>
                          <p className="text-5xl font-bold" style={{ fontFamily: "'Cooper BT', serif" }}>
                            {result.risk_breakdown.MEDIUM}
                          </p>
                        </div>
                        <span className="text-5xl">⚠️</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold opacity-90" style={{ fontFamily: "'Cooper BT', serif" }}>
                            LOW Risk
                          </p>
                          <p className="text-5xl font-bold" style={{ fontFamily: "'Cooper BT', serif" }}>
                            {result.risk_breakdown.LOW}
                          </p>
                        </div>
                        <span className="text-5xl">✅</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center p-6" style={{ backgroundColor: '#e6dfd7' }}>
                  <img 
                    src="/images/hero_pic2.png" 
                    alt="Compliance Robot" 
                    className="w-full max-w-sm object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Overall Recommendation Banner */}
            <div 
              data-card-id="recommendation"
              className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-6 shadow-xl transition-all duration-1000 ease-out"
              style={{
                opacity: visibleCards.has('recommendation') ? 1 : 0,
                transform: visibleCards.has('recommendation') ? 'scale(1)' : 'scale(0.95)',
                transitionDelay: '0.1s'
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">⚖️</span>
                <div className="flex-1">
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                  >
                    Overall Recommendation
                  </h3>
                  <p 
                    className="text-lg leading-relaxed text-white"
                    style={{ fontFamily: "'Cooper BT', serif" }}
                  >
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Conflicts Section */}
            <div>
              <h3 
                data-card-id="conflicts-header"
                className="text-3xl font-bold mb-6 flex items-center gap-3 transition-all duration-1000 ease-out"
                style={{ 
                  fontFamily: "'Cooper BT', serif", 
                  color: '#c1a673',
                  opacity: visibleCards.has('conflicts-header') ? 1 : 0,
                  transform: visibleCards.has('conflicts-header') ? 'translateX(0)' : 'translateX(-50px)'
                }}
              >
                <span>🔍</span>
                Identified Conflicts
                <span className="text-xl text-gray-600">({sortedRisks.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedRisks.map((risk, index) => (
                  <div
                    key={index}
                    data-card-id={`conflict-${index}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-700 ease-out"
                    style={{
                      opacity: visibleCards.has(`conflict-${index}`) ? 1 : 0,
                      transform: visibleCards.has(`conflict-${index}`) ? 'translateY(0)' : 'translateY(50px)',
                      transitionDelay: `${index * 0.1}s`
                    }}
                  >
                    <div 
                      className={`p-4 flex items-center justify-between ${
                        risk.severity === 'HIGH'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : risk.severity === 'MEDIUM'
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {risk.severity === 'HIGH' ? '⛔' : risk.severity === 'MEDIUM' ? '⚠️' : '✅'}
                        </span>
                        <div>
                          <h4 
                            className="text-xl font-bold text-white"
                            style={{ fontFamily: "'Cooper BT', serif" }}
                          >
                            {risk.policy_id}
                          </h4>
                          <p className="text-white text-xs opacity-90" style={{ fontFamily: "'Cooper BT', serif" }}>
                            Conflict #{index + 1}
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-4 py-1 bg-white rounded-full text-sm font-bold"
                        style={{ 
                          fontFamily: "'Cooper BT', serif",
                          color: risk.severity === 'HIGH' ? '#dc2626' : risk.severity === 'MEDIUM' ? '#ca8a04' : '#16a34a'
                        }}
                      >
                        {risk.severity}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <h5 
                          className="text-base font-bold mb-2 flex items-center gap-2"
                          style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                        >
                          <span>📋</span> Summary
                        </h5>
                        <p 
                          className="text-sm text-gray-800 leading-relaxed"
                          style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                          {risk.divergence_summary}
                        </p>
                      </div>

                      <div 
                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-l-4 border-black"
                      >
                        <h5 
                          className="text-base font-bold mb-2 flex items-center gap-2"
                          style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                        >
                          <span>💡</span> Action Required
                        </h5>
                        <p 
                          className="text-sm text-gray-800 leading-relaxed"
                          style={{ fontFamily: "'Cooper BT', serif" }}
                        >
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Analysis
