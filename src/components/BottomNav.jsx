import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Bot, User } from 'lucide-react'

const tabs = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'My Learning', icon: BookOpen, path: '/learn' },
    { label: 'AI Coach', icon: Bot, path: '/coach' },
    { label: 'Profile', icon: User, path: '/profile' },
]

export default function BottomNav() {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    return (
        <>
            {/* ── DESKTOP — top navbar ── */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50
                      bg-gray-950/95 backdrop-blur-sm border-b border-gray-800
                      h-14 justify-center">
                <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-24 flex items-center justify-between">
                    <span
                        onClick={() => navigate('/')}
                        className="text-white font-bold text-lg cursor-pointer tracking-tight"
                    >
                        Scientific<span className="text-blue-400">FREAK</span>
                    </span>
                    <div className="flex items-center gap-6">
                        {tabs.map(({ label, icon: Icon, path }) => {
                            const active = pathname === path
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`flex items-center gap-2 text-sm font-medium
                              transition-colors duration-150
                              ${active ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </nav>

            {/* ── MOBILE — bottom tab bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-gray-950/95 backdrop-blur-sm border-t border-gray-800
                      pb-safe">
                <div className="flex items-center justify-around h-16">
                    {tabs.map(({ label, icon: Icon, path }) => {
                        const active = pathname === path
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className="flex flex-col items-center justify-center gap-1
                           flex-1 h-full transition-colors duration-150"
                            >
                                <Icon
                                    size={22}
                                    className={active ? 'text-blue-400' : 'text-gray-500'}
                                    strokeWidth={active ? 2.2 : 1.8}
                                />
                                <span className={`text-[10px] font-medium tracking-wide
                                  ${active ? 'text-blue-400' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}