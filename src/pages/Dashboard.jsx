import React, { useEffect, useState } from "react";
import { url } from "../../mainurl";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  ArrowUpRight,
} from "lucide-react";

const Dashboard = () => {
  const token = localStorage.getItem("access");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    today: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`${url}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = res.data?.results || res.data;

      const todayDate = new Date().toDateString();

      const total = users.length;
      const active = users.filter((u) => u.is_active).length;
      const blocked = users.filter((u) => !u.is_active).length;

      const today = users.filter(
        (u) =>
          new Date(u.date_joined || u.last_login).toDateString() === todayDate
      ).length;

      const sorted = [...users]
        .sort(
          (a, b) =>
            new Date(b.date_joined || b.last_login) -
            new Date(a.date_joined || a.last_login)
        )
        .slice(0, 5);

      setStats({ total, active, blocked, today });
      setRecentUsers(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  const cards = [
    { title: "Total Users", value: stats.total, icon: Users, color: "bg-indigo-500" },
    { title: "Active Users", value: stats.active, icon: UserCheck, color: "bg-green-500" },
    { title: "Blocked Users", value: stats.blocked, icon: UserX, color: "bg-red-500" },
    { title: "Today Joined", value: stats.today, icon: Activity, color: "bg-purple-500" },
  ];

  return (
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-gray-500 text-sm">Live system overview</p>
        </div>

  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h2 className="text-2xl font-semibold mt-1">{item.value}</h2>
                  <div className="flex items-center text-green-600 text-sm mt-2">
                    <ArrowUpRight size={14} /> Live
                  </div>
                </div>

                <div className={`w-12 h-12 ${item.color} text-white rounded-lg flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h4 className="font-semibold mb-4">Recent Users</h4>

          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex justify-between border-b pb-2 last:border-none">
                <div>
                  <p className="font-medium">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {u.is_active ? "Active" : "Blocked"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
  );
};

export default Dashboard;
