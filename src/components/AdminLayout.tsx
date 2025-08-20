import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Users, CreditCard, BrainCircuit } from 'lucide-react';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f7f9fc;
`;

const Sidebar = styled.div`
  width: 260px;
  background: #111827; /* Darker background */
  padding: 24px;
  display: flex;
  flex-direction: column;
  color: white;
  border-right: 1px solid #374151;
`;

const Logo = styled.h2`
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 40px;
    text-align: center;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  color: #d1d5db; /* Lighter text for better contrast */
  text-decoration: none;
  margin-bottom: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  
  &:hover {
    background: #374151; /* Hover state */
    color: #ffffff;
  }
  
  &.active {
    background: #007bff;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
  }

  svg {
    margin-right: 12px;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 40px;
  overflow-y: auto;
`;


export const AdminLayout = () => {
    return (
        <LayoutContainer>
            <Sidebar>
                <Logo>WiseRoute Admin</Logo>
                <nav>
                    <NavItem to="/admin/users">
                        <Users size={20} /> User Management
                    </NavItem>
                    <NavItem to="/admin/psps">
                        <CreditCard size={20} /> PSP Management
                    </NavItem>
                    <NavItem to="/admin/ai-controls">
                        <BrainCircuit size={20} /> AI Controls
                    </NavItem>
                </nav>
            </Sidebar>
            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};