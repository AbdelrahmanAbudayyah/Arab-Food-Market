import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const GuestContext = createContext();

function GuestProvider({ children }) {
  const [guest, setGuest] = useState(true); // just a flag to indicate guest browsing
  const [tempLocation, setTempLocation] = useState({ state: "", city: "" });
  const navigate = useNavigate();

  const guestBrowse = (guestLocation) => {
    setGuest(true); // just marking as guest
    setTempLocation({
      state: guestLocation?.state || "",
      city: guestLocation?.city || "",
    });
    navigate("/home"); // redirect guest to home
  };

  return (
    <GuestContext.Provider
      value={{ guest, setGuest, tempLocation, setTempLocation, guestBrowse }}
    >
      {children}
    </GuestContext.Provider>
  );
}

function useGuest() {
  return useContext(GuestContext);
}

export { GuestProvider, useGuest };
