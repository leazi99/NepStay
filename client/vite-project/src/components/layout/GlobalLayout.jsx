import React from 'react'
import { Outlet } from 'react-router-dom'
import BrandHeader from '../ui/BrandHeader'
import BrandFooter from '../ui/BrandFooter'

const GlobalLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <BrandHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <BrandFooter />
    </div>
  )
}

export default GlobalLayout
