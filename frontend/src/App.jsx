import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Analysis from './pages/Analysis'
import JsonViewer from './pages/JsonViewer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/json-viewer" element={<JsonViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
