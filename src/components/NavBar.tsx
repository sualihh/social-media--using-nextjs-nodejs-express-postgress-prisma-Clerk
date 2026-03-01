import React from 'react'
import Link from 'next/link'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'
import { currentUser } from '@clerk/nextjs/server'
import { syncUser } from '@/action/user.action'

async function NavBar() {
  const user = await currentUser()

  if (user) await syncUser()// post request
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur [backdrop-filter]:bg-background/60 z-50">
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
                <Link href='/' className="text-xl font-bold text-primary font-sans-mono tracking-wider">Social Media</Link>
            </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
