import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">

        <Link to="/dashboard" className="flex items-center gap-2 text-decoration-none">
          <span className="text-xl font-bolder text-indigo-700">Jobs Management</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm">

              {user.image ? (
                <img
                  src={user.image}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
              )}

              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none mt-3">
                  {user.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
