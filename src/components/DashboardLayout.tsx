// src/components/DashboardLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutDashboard, ArrowLeftRight, KeyRound, LogOut } from 'lucide-react';

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
  // We will add the logout function here later
  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>WiseRoute</Logo> {/* You can change this name */}
        <Nav>
          <StyledNavLink to="/" end><LayoutDashboard size={20} /> Overview</StyledNavLink>
          <StyledNavLink to="/transactions"><ArrowLeftRight size={20} /> Transactions</StyledNavLink>
          <StyledNavLink to="/api-keys"><KeyRound size={20} /> API Keys</StyledNavLink>
        </Nav>
        <StyledNavLink to="/login" onClick={() => {/* Handle Logout */}}><LogOut size={20} /> Logout</StyledNavLink>
      </Sidebar>
      <MainContent>
        <Outlet /> {/* This is where our pages will be rendered */}
      </MainContent>
    </LayoutContainer>
  );
}