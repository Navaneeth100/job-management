import React, { useState } from "react";
import Sidebar from "../pages/Sidebar"; 
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">

      <Sidebar open={open} setOpen={setOpen} />


      <div 
        className={`flex-1 transition-all duration-300 
        ${open ? "pl-64" : "pl-16"}`
    }
      >

        <Navbar />

        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
