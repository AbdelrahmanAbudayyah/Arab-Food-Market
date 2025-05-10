import ChefHomePage from './ChefHomePage';
import CustomerHomePage from './CustomerHomePage';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path to where your context is
import { useGuest } from '../contexts/GuestContext'; // Adjust the path to where your context is

// Simulate login state. Replace with real logic.
export default function HomePage() {
    const { user } = useAuth(); // This gives you access to the user state
    const { guest } = useGuest(); // This gives you access to the guest state

    if (user?.type === 'chef') {
        return <ChefHomePage />;
      }
    
      if (user?.type === 'customer' || guest) {
        return <CustomerHomePage />;
      }
    
      return <div>Loading...</div>; // Fallback while waiting for auth/guest
  }
