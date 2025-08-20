// src/components/AdminLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Users, CreditCard, LogOut } from 'lucide-react';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: #4b5563; /* A different color for the admin panel */
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
    background-color: #6b7280;
    color: white;
  }

  &:hover {
    background-color: #374151;
    color: white;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 2rem;
`;

export function AdminLayout() {
  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>Admin Panel</Logo>
        <Nav>
          <StyledNavLink to="/admin/users"><Users size={20} /> User Management</StyledNavLink>
          <StyledNavLink to="/admin/psps"><CreditCard size={20} /> PSP Management</StyledNavLink>
        </Nav>
        <StyledNavLink to="/"><LogOut size={20} /> Back to App</StyledNavLink>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}