import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Analysis() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('manual')
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
      className="min-h-screen overflow-x-hidden flex flex-col" 
      style={{ 
        backgroundColor: '#e6dfd7',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Custom scrollbar styles */}
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        html {
          scroll-behavior: smooth;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>

      {/* Header */}
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
            className="ml-10 h-20 transition-transform duration-500 ease-in-out cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(45deg)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2 border-2 border-black rounded-none transition-all duration-300 hover:bg-black hover:text-white cursor-pointer group"
            style={{ fontFamily: "'Cooper BT', serif" }}
          >
            <span className="text-sm">←</span>
            <span className="text-sm group-hover:text-white">RETURN HOME</span>
          </button>

          {result && (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section - Form with Loading Overlay */}
        <section 
          className="max-w-4xl mx-auto px-12 py-16 transition-all duration-1000 ease-out"
          style={{
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'scale(1)' : 'scale(0.95)',
            transitionDelay: '0.1s'
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
            {/* Loading Overlay */}
            {loading && (
              <div 
                className="absolute inset-0 flex items-center justify-center z-50"
                style={{ 
                  backgroundColor: 'rgba(230, 223, 215, 0.98)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    {/* Outer rotating circle */}
                    <div 
                      className="w-32 h-32 rounded-full border-8 animate-spin-slow"
                      style={{ 
                        borderColor: '#e6dfd7',
                        borderTopColor: '#1a1a1a'
                      }}
                    ></div>
                    {/* Inner icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <img 
                        src="/images/lexia_icon.png" 
                        alt="Loading" 
                        className="h-16 w-16"
                      />
                    </div>
                  </div>
                  <p 
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}
                  >
                    Analyzing Regulation...
                  </p>
                  <p 
                    className="text-base text-gray-600"
                    style={{ fontFamily: "'Cooper BT', serif" }}
                  >
                    This may take 15-30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <img 
              src="/images/lexia_Logo.png" 
              alt="Lexia Logo" 
              className="h-16 mx-auto mb-8"
            />
            
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ fontFamily: "'Cooper BT', serif", color: '#1a1a1a' }}
            >
              New Compliance Analysis
            </h1>
            
            <p 
              className="text-lg text-gray-600 mb-8"
              style={{ fontFamily: "'Cooper BT', serif" }}
            >
              Select your input method to begin.
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-8 mb-8 border-b-2 border-gray-200 pb-4">
              <button
                onClick={() => setActiveTab('manual')}
                disabled={loading}
                className={`text-lg font-semibold transition-all duration-300 ${
                  activeTab === 'manual'
                    ? 'border-b-4 border-black pb-2'
                    : 'text-gray-400 pb-2'
                }`}
                style={{ 
                  fontFamily: "'Cooper BT', serif",
                  color: activeTab === 'manual' ? '#1a1a1a' : undefined
                }}
              >
                MANUAL ENTRY
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                disabled={loading}
                className={`text-lg font-semibold transition-all duration-300 ${
                  activeTab === 'upload'
                    ? 'border-b-4 border-black pb-2'
                    : 'text-gray-400 pb-2'
                }`}
                style={{ 
                  fontFamily: "'Cooper BT', serif",
                  color: activeTab === 'upload' ? '#1a1a1a' : undefined
                }}
              >
                DOCUMENT UPLOAD
              </button>
            </div>

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <form onSubmit={handleTextSubmit} className="space-y-6">
                <div className="text-center">
                  <p 
                    className="text-xl mb-6"
                    style={{ fontFamily: "'Cooper BT', serif", color: '#1a1a1a' }}
                  >
                    5 years holding data customers
                  </p>
                  
                  <textarea
                    value={regulationText}
                    onChange={(e) => setRegulationText(e.target.value)}
                    disabled={loading}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all resize-none disabled:bg-gray-100"
                    style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                    rows="6"
                    placeholder="Enter regulation text here..."
                    required
                  />
                </div>

                <div className="flex items-center justify-center gap-4">
                  <input
                    type="date"
                    value={dateOfLaw}
                    onChange={(e) => setDateOfLaw(e.target.value)}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all disabled:bg-gray-100"
                    style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                    placeholder="mm/dd/yyyy"
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3 bg-black text-white rounded-none transition-all duration-300 hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
                    style={{ fontFamily: "'Cooper BT', serif" }}
                  >
                    {loading ? 'ANALYZING...' : 'START ANALYSIS'}
                  </button>
                </div>
              </form>
            )}

            {/* Document Upload Tab */}
            {activeTab === 'upload' && (
              <form onSubmit={handlePdfSubmit} className="space-y-6">
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-black transition-all cursor-pointer" style={{ backgroundColor: loading ? '#f5f5f5' : '#fafafa' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    required
                  />
                  <div className="text-center">
                    <p className="text-5xl mb-4">📄</p>
                    <p 
                      className="text-xl font-semibold mb-2" 
                      style={{ fontFamily: "'Cooper BT', serif", color: '#1a1a1a' }}
                    >
                      {pdfFile ? pdfFile.name : 'Click or drag file to upload'}
                    </p>
                    {pdfFile && (
                      <p className="text-sm text-gray-600" style={{ fontFamily: "'Cooper BT', serif" }}>
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <input
                    type="date"
                    value={dateOfLaw}
                    onChange={(e) => setDateOfLaw(e.target.value)}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all disabled:bg-gray-100"
                    style={{ fontFamily: "'Cooper BT', serif", backgroundColor: '#fafafa' }}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !pdfFile}
                    className="px-10 py-3 bg-black text-white rounded-none transition-all duration-300 hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
                    style={{ fontFamily: "'Cooper BT', serif" }}
                  >
                    {loading ? 'ANALYZING...' : 'START ANALYSIS'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto px-12">
            <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-8 shadow-md">
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
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div ref={resultsRef} className="max-w-7xl mx-auto px-12 py-8 space-y-8">
            {/* Stats Hero */}
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

            {/* Overall Recommendation */}
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

      {/* Footer */}
      <footer 
        className="py-8 px-12 border-t"
        style={{ backgroundColor: '#e6dfd7', borderColor: '#c1a673' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/images/lexia_Logo.png"
              alt="Lexia"
              className="h-12"
            />
            <span 
              className="text-sm"
              style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }}
            >
              © 2025 Lexia. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a 
              href="#" 
              className="text-sm hover:underline cursor-pointer"
              style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm hover:underline cursor-pointer"
              style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm hover:underline cursor-pointer"
              style={{ color: '#1a1a1a', fontFamily: "'Cooper BT', serif" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Analysis
