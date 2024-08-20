import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './fonts/Satoshi-Black.otf'
import './fonts/Satoshi-Bold.otf'
import './fonts/Satoshi-Light.otf'
import './fonts/Satoshi-Medium.otf'
import './fonts/Satoshi-Regular.otf'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
