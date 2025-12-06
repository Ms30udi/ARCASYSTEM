import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function JsonViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const jsonData = location.state?.jsonData
  const [copied, setCopied] = useState(false)

  if (!jsonData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4" style={{ fontFamily: "'Cooper BT', serif" }}>
            No JSON data available
          </p>
          <button
            onClick={() => navigate('/analysis')}
            className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition cursor-pointer"
            style={{ fontFamily: "'Cooper BT', serif" }}
          >
            ← Back to Analysis
          </button>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(jsonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compliance_report_${jsonData.regulation_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition cursor-pointer"
              style={{ fontFamily: "'Cooper BT', serif" }}
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cooper BT', serif", color: '#c1a673' }}>
                JSON Viewer
              </h1>
              <p className="text-sm text-gray-400" style={{ fontFamily: "'Cooper BT', serif" }}>
                Regulation ID: {jsonData.regulation_id}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition cursor-pointer"
              style={{ fontFamily: "'Cooper BT', serif" }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 bg-black rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <span style={{ color: '#c1a673', fontFamily: "'Cooper BT', serif" }} className="font-semibold">
                💾 Download
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* JSON Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gray-950 px-6 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm" style={{ fontFamily: "'Cooper BT', serif" }}>
                compliance_report.json
              </span>
            </div>
            <span className="text-xs text-gray-500" style={{ fontFamily: "'Cooper BT', serif" }}>
              {JSON.stringify(jsonData, null, 2).split('\n').length} lines
            </span>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm leading-relaxed">
              <code className="language-json" style={{ fontFamily: "'Courier New', monospace" }}>
                {JSON.stringify(jsonData, null, 2)
                  .split('\n')
                  .map((line, index) => {
                    let color = '#e5e7eb' // default gray
                    if (line.includes('"HIGH"')) color = '#ef4444' // red
                    else if (line.includes('"MEDIUM"')) color = '#eab308' // yellow
                    else if (line.includes('"LOW"')) color = '#22c55e' // green
                    else if (line.match(/"[^"]+"\s*:/)) color = '#60a5fa' // blue for keys
                    else if (line.match(/:\s*"[^"]+"/)) color = '#a78bfa' // purple for string values
                    else if (line.match(/:\s*\d+/)) color = '#fbbf24' // amber for numbers
                    
                    return (
                      <div key={index} style={{ color }}>
                        <span className="text-gray-600 mr-4 select-none" style={{ minWidth: '3em', display: 'inline-block' }}>
                          {index + 1}
                        </span>
                        {line}
                      </div>
                    )
                  })}
              </code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

export default JsonViewer
