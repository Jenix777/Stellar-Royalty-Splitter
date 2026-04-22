import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";

// Freighter is injected at runtime by the browser extension
declare global {
  interface Window {
    freighter?: {
      requestAccess: () => Promise<{ address: string }>;
      getAddress: () => Promise<{ address: string }>;
    };
  }
}
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Settings } from "./components/Settings";
import WalletConnect from "./components/WalletConnect";
import InitializeForm from "./components/InitializeForm";
import DistributeForm from "./components/DistributeForm";
import { TransactionHistory } from "./components/TransactionHistory";
import SecondaryRoyaltyConfig from "./components/SecondaryRoyaltyConfig";
import RecordSecondarySale from "./components/RecordSecondarySale";
import DistributeSecondaryRoyalties from "./components/DistributeSecondaryRoyalties";
import ResaleHistory from "./components/ResaleHistory";
import "./App.css";

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contractId, setContractId] = useState(
    () => localStorage.getItem("lastContractId") ?? ""
  );
  const [royaltyRate, setRoyaltyRate] = useState(500); // Default 5%
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Silently reconnect Freighter if it was previously authorized
  useEffect(() => {
    async function tryReconnect() {
      // window.freighter is injected at runtime by the browser extension
      if (!window.freighter) return;
      try {
        const { address } = await window.freighter.getAddress();
        if (address) setWalletAddress(address);
      } catch {
        // Not yet authorized — user must connect manually
      }
    }
    tryReconnect();
  }, []);

  function handleContractChange(value: string) {
    setContractId(value);
    if (value) localStorage.setItem("lastContractId", value);
    else localStorage.removeItem("lastContractId");
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return contractId ? (
          <Dashboard contractId={contractId} />
        ) : (
          <div className="page-empty">
            <div className="empty-content">
              <h2>Welcome to Stellar Royalty Splitter</h2>
              <p>Select or initialize a contract to get started</p>
            </div>
          </div>
        );
      case "transactions":
        return contractId ? (
          <TransactionHistory contractId={contractId} />
        ) : (
          <div className="page-empty">
            <p>Please select a contract first</p>
          </div>
        );
      case "initialize":
        return walletAddress ? (
          <div className="page-section">
            <InitializeForm
              contractId={contractId}
              walletAddress={walletAddress}
              onSuccess={() => {}}
            />
          </div>
        ) : (
          <div className="page-empty">
            <p>Please connect your wallet first</p>
          </div>
        );
      case "distribute":
        return walletAddress ? (
          <div className="page-section">
            <DistributeForm
              contractId={contractId}
              walletAddress={walletAddress}
              onSuccess={() => {}}
            />
          </div>
        ) : (
          <div className="page-empty">
            <p>Please connect your wallet first</p>
          </div>
        );
      case "admin":
        return contractId ? (
          <AdminDashboard contractId={contractId} />
        ) : (
          <div className="page-empty">
            <p>Please select a contract first</p>
          </div>
        );
      case "settings":
        return <Settings contractId={contractId} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-wrapper">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        walletAddress={walletAddress}
      />

      <div className="app-content">
        <div className="app-sidebar">
          <div className="sidebar-card">
            <h3>🔗 Wallet Connection</h3>
            <WalletConnect onConnect={setWalletAddress} />
          </div>

          <div className="sidebar-card">
            <h3>📋 Contract ID</h3>
            <input
              className="contract-input"
              placeholder="C..."
              value={contractId}
              onChange={(e) => handleContractChange(e.target.value)}
            />
          </div>

          {contractId && (
            <div className="sidebar-card">
              <h3>📊 Quick Actions</h3>
              <div className="quick-actions">
                <button
                  className={`quick-action-btn ${
                    currentPage === "dashboard" ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage("dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className={`quick-action-btn ${
                    currentPage === "transactions" ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage("transactions")}
                >
                  History
                </button>
                {walletAddress && (
                  <>
                    <button
                      className={`quick-action-btn ${
                        currentPage === "initialize" ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage("initialize")}
                    >
                      Initialize
                    </button>
                    <button
                      className={`quick-action-btn ${
                        currentPage === "distribute" ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage("distribute")}
                    >
                      Distribute
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="app-main">{renderPage()}</div>
      </div>

      {/* Hidden sections for additional features - accessible via navigation */}
      {currentPage === "hidden-secondary" && walletAddress && (
        <div className="hidden-section">
          <div className="section-divider">
            <h2>Secondary Royalty Management</h2>
          </div>

          <SecondaryRoyaltyConfig
            contractId={contractId}
            walletAddress={walletAddress}
            onSuccess={() => {}}
            onRateUpdate={setRoyaltyRate}
          />

          <RecordSecondarySale
            contractId={contractId}
            walletAddress={walletAddress}
            royaltyRate={royaltyRate}
            onSuccess={() => {}}
          />

          <DistributeSecondaryRoyalties
            contractId={contractId}
            walletAddress={walletAddress}
            onSuccess={() => {}}
          />

          <ResaleHistory contractId={contractId} />
        </div>
      )}
    </div>
  );
}
