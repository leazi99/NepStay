import React from 'react'

const BrandFooter = () => {
  return (
    <footer className="w-full border-t bg-white/90 dark:bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-300">
        © {new Date().getFullYear()} Nepstay. Built for guests and hotel staff.
      </div>
    </footer>
  )
}

export default BrandFooter
