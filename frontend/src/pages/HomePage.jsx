import ChefHomePage from './ChefHomePage';
import CustomerHomePage from './CustomerHomePage';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';

export default function HomePage() {
    const { user } = useAuth(); 
    const { guest } = useGuest(); 

    if (user?.type === 'chef') {
        return <ChefHomePage />;
      }
      if (user?.type === 'customer' || guest) {
        return <CustomerHomePage />;
      }
    
      return <div>Loading...</div>; // Fallback while waiting for auth/guest
  }
