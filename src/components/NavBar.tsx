import React from 'react'
import Link from 'next/link'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'
import { currentUser } from '@clerk/nextjs/server'
import { syncUser } from '@/action/user.action'
import { Sparkles } from 'lucide-react'

async function NavBar() {
  const user = await currentUser()

  if (user) await syncUser()// post request
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur [backdrop-filter]:bg-background/60 z-50">
      <div className='mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10'>
        <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  Hulux
                </Link>
            </div>
            <DesktopNavbar />
            <MobileNavbar />
        </div>
      </div>
    </nav>
  )
}

export default NavBar
