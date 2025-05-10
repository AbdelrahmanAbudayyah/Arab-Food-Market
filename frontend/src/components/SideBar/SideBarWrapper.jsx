import LoggedOutSideBar from './LogedOutSideBar';
import LoggedInSideBar from './LogedInSideBar';
import { useAuth } from '../../contexts/AuthContext'; // Adjust the path to where your context is

// Simulate login state. Replace with real logic.
export default function SideBarWrapper({ sidebarOpen, setSidebarOpen }) {
    const { user } = useAuth(); // This gives you access to the user state
  
    return user ? (
      <LoggedInSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    ) : (
      <LoggedOutSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    );
  }
