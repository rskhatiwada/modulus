import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function MainLayout() {
    return (
        <div className="pb-16 md:pb-0 md:pt-14">
            <Outlet />
            <BottomNav />
        </div>
    )
}