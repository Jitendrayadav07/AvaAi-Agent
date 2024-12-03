import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiSwordLine } from "react-icons/ri";
import { BiStore } from "react-icons/bi";
import { MdContactSupport } from "react-icons/md";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("avaai");

  const menuItems = [
    { id: "avaai", icon: RiSwordLine, label: "AvaAi", path: "/avaai" },
    { id: "market", icon: BiStore, label: "Trade", path: "/market" },
  ];

  return (
    <div className="fixed left-0 h-screen w-64 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          CryptoVerse
        </h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-6 py-4 text-gray-300 hover:bg-gray-800 transition-colors duration-200 ${
                activeItem === item.id
                  ? "bg-gray-800 border-r-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveItem(item.id)}
            >
              <Icon className="w-6 h-6 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
