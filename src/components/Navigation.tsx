'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/vetnav', label: 'VetNav', icon: '🇺🇸' },
    { href: '/tariff-explorer', label: 'Tariff Explorer', icon: '📊' },
    { href: '/pet-radar', label: 'Pet Radar', icon: '🐕' },
    { href: '/jets-home', label: 'Jets Stats', icon: '✈️' }
  ]

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white">
            ATX BRO
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
