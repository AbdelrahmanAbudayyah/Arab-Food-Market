import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

 function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem("user"); // Store user in localStorage if logged in
    if (loggedUser) {
      const parsedUser = JSON.parse(loggedUser);
      setUser(parsedUser);  
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Store user data on login
    navigate("/home"); // Redirect to customer home after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user data on logout
    navigate("/"); // Redirect to welcome page (page 1)
  };

  return (
    <AuthContext.Provider value={{ user,setUser ,login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

 function useAuth() {
  return useContext(AuthContext);
}

export {useAuth,AuthProvider};
