import React from "react";
import { Users2 } from "lucide-react";

const Team = () => {
  return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        
        <Users2 size={70} className="text-indigo-500 mb-4" />

        <h1 className="text-2xl font-semibold mb-2">Team Page</h1>
        <p className="text-gray-500 max-w-md">
          This page will contain team members, roles, and permissions.
          Backend integration coming soon.
        </p>

      </div>
  );
};

export default Team;
