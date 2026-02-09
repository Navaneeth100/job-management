import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">

      <SettingsIcon size={70} className="text-indigo-500 mb-4" />

      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-gray-500 max-w-md">
        Application configuration, profile settings, password change,
        and system preferences will appear here.
      </p>

    </div>
  );
};

export default Settings;
