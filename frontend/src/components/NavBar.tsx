'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Hub', icon: '🏠' },
  { href: '/battle', label: 'Arene', icon: '⚔️' },
  { href: '/market', label: 'Marche', icon: '🏪' },
  { href: '/shop', label: 'Shop', icon: '🛒' },
  { href: '/inventory', label: 'Sac', icon: '🎒' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-2 z-50">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center text-xs ${
            pathname === item.href ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
