import { useState } from 'react'
import LogViewer from './LogsViewer'
import "./App.css"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div id="site-container">
      <LogViewer></LogViewer>
    </div>
  )
}

export default App
