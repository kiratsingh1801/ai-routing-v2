// src/components/DashboardLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutDashboard, ArrowLeftRight, KeyRound, BrainCircuit, LogOut, Activity, HeartPulse } from 'lucide-react'; // <-- IMPORT ICON
import { supabase } from '../supabaseClient';

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #f9fafb;
`;

const Sidebar = styled.aside`
    width: 250px;
    background-color: #111827;
    color: white;
    padding: 1rem;
    display: flex;
    flex-direction: column;
`;

const Logo = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
`;

const Nav = styled.nav`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    color: #d1d5db;
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;

    &.active {
        background-color: #374151;
        color: white;
    }

    &:hover {
        background-color: #1f2937;
        color: white;
    }
`;

const MainContent = styled.main`
    flex-grow: 1;
    padding: 2rem;
`;

export function DashboardLayout() {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <LayoutContainer>
            <Sidebar>
                <Logo>WiseRoute</Logo>
                <Nav>
                    <StyledNavLink to="/" end><LayoutDashboard size={20} /> Overview</StyledNavLink>
                    <StyledNavLink to="/transactions"><ArrowLeftRight size={20} /> Transactions</StyledNavLink>
                    <StyledNavLink to="/monitoring"><Activity size={20} /> Monitoring</StyledNavLink>
                    <StyledNavLink to="/psp-health"><HeartPulse size={20} /> PSP Health</StyledNavLink> {/* <-- NEW LINK */}
                    <StyledNavLink to="/api-keys"><KeyRound size={20} /> API Keys</StyledNavLink>
                    <StyledNavLink to="/routing-strategy"><BrainCircuit size={20} /> Routing Strategy</StyledNavLink>
                </Nav>
                <StyledNavLink to="/login" onClick={handleLogout}><LogOut size={20} /> Logout</StyledNavLink>
            </Sidebar>
            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
}
