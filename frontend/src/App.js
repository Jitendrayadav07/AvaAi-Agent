import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Market from "./pages/Market";
import AvaAi from "./pages/AvaAi";
import MetaMaskConnector from "./MetaMaskConnector";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);

  const handleConnect = (account, balance) => {
    setConnectedAccount(account);
    setAccountBalance(balance);
  };

  return (
    <Router>
      <div className="flex bg-gray-900 overflow-y-hidden">
        <Sidebar />
        <div className="flex-1 ml-64">
          {/* Navbar */}
          <div className="fixed z-30 top-0 right-0 w-[calc(100%-16rem)] h-20 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
            <div className="flex items-center space-x-6"></div>
            <div className="flex items-center space-x-6">
              <MetaMaskConnector onConnect={handleConnect} />
            </div>
          </div>
          <main className="mt-20 text-white bg-gray-900 w-full overflow-x-hidden">
            <Routes>
              <Route
                path="/"
                element={
                  <AvaAi
                    connectedAccount={connectedAccount}
                    accountBalance={accountBalance}
                  />
                }
              />
              <Route
                path="/avaai"
                element={
                  <AvaAi
                    connectedAccount={connectedAccount}
                    accountBalance={accountBalance}
                  />
                }
              />
              <Route path="/market" element={<Market />} />
            </Routes>
          </main>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </Router>
  );
}

export default App;
