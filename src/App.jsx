import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className='flex-center'>
      <h1>Hello Turnus</h1>
    </div>
  )
}

export default App