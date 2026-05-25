import React from 'react'
import { Link } from 'react-router-dom'
import nepstayLogoMini from '../../assets/nepstay-logo-mini.svg'

const BrandHeader = () => {
  return (
    <header className="w-full border-b bg-white/90 dark:bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to='/' className="inline-flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-nep-500 flex items-center justify-center shadow-sm">
            <img src={nepstayLogoMini} alt="Nepstay" className="h-6 w-6" />
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-white">Nepstay</span>
        </Link>
      </div>
    </header>
  )
}

export default BrandHeader
