import LoggedOutSideBar from './LogedOutSideBar';
import LoggedInSideBar from './LogedInSideBar';
import { useAuth } from '../../contexts/AuthContext';

export default function SideBarWrapper({ sidebarOpen, setSidebarOpen }) {
    const { user } = useAuth(); 
  
    return user ? (
      <LoggedInSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    ) : (
      <LoggedOutSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    );
  }
