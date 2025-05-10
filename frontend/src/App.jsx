import {Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WelcomePage from "./pages/WelcomePage";
import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage";
import ChefMenu from "./pages/ChefMenu";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
        <>
        
       <Header />
        <Routes>
         
          <Route path="/" element={<WelcomePage />} />  {/* Page 1: Welcome */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/chef/:id/:name?" element={<ChefMenu />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/messages/:id?/:name?" element={<MessagesPage />} />




        </Routes>
        <ToastContainer />


        </>
  );
}

export default App;

