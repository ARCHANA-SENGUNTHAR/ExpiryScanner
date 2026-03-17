import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AddItemModal from "./components/items/AddItemModal";

import DashboardPage from "./pages/DashboardPage";
import ScannerPage from "./pages/ScannerPage";
import CookingInsights from "./pages/CookingInsights";
import ItemsPage from "./pages/ItemsPage";
import AuthPage from "./pages/AuthPage";

const VALID_PAGES = new Set(["auth", "dashboard", "scanner", "cooking", "items"]);

const getPageFromHash = () => {
  const hashPage = window.location.hash.replace(/^#/, "");
  const defaultPage =
    localStorage.getItem("isAuthenticated") === "true" ? "dashboard" : "auth";
  return VALID_PAGES.has(hashPage) ? hashPage : defaultPage;
};

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const syncPageWithHash = () => {
      const nextPage = getPageFromHash();
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

      if (!isAuthenticated && nextPage !== "auth") {
        setPage("auth");
        if (window.location.hash !== "#auth") {
          window.history.replaceState(null, "", "#auth");
        }
        return;
      }

      setPage(nextPage);
    };

    syncPageWithHash();
    window.addEventListener("hashchange", syncPageWithHash);

    return () => {
      window.removeEventListener("hashchange", syncPageWithHash);
    };
  }, []);

  const navigateToPage = (nextPage, { replace = false } = {}) => {
    const fallbackPage =
      localStorage.getItem("isAuthenticated") === "true" ? "dashboard" : "auth";
    const safePage = VALID_PAGES.has(nextPage) ? nextPage : fallbackPage;
    const nextHash = `#${safePage}`;

    if (window.location.hash === nextHash) {
      setPage(safePage);
      return;
    }

    if (replace) {
      window.history.replaceState(null, "", nextHash);
      setPage(safePage);
      return;
    }

    window.location.hash = safePage;
  };

  const openAddItemModal = () => setShowAddModal(true);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigateToPage("auth", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#DFFFD8]/40">
      {/* SIDEBAR (HIDDEN ON AUTH) */}
      {page !== "auth" && (
        <Sidebar
          user={user}
          onShowScanner={() => navigateToPage("scanner")}
          onShowDashboard={() => navigateToPage("dashboard")}
          onShowItems={() => navigateToPage("items")}
          collapsed={!sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER (HIDDEN ON AUTH) */}
        {page !== "auth" && (
          <Header
            onShowScanner={() => navigateToPage("scanner")}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* PAGE CONTENT */}
        <div key={page} className="flex-1 animate-[fadeIn_0.3s_ease-out]">
          {/* AUTH PAGE */}
          {page === "auth" && (
            <AuthPage
              onAuthSuccess={(userData) => {
                setUser(userData);
                navigateToPage("dashboard", { replace: true });
              }}
            />
          )}

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <DashboardPage
              onShowCooking={() => navigateToPage("cooking")}
              onShowItems={() => navigateToPage("items")}
              onAddItem={openAddItemModal}
              onLogout={handleLogout}
              onShowScanner={() => navigateToPage("scanner")}
            />
          )}

          {/* SCANNER */}
          {page === "scanner" && (
            <ScannerPage onBack={() => navigateToPage("dashboard")} />
          )}

          {/* COOKING */}
          {page === "cooking" && (
            <CookingInsights onBack={() => navigateToPage("dashboard")} />
          )}

          {/* ITEMS */}
          {page === "items" && <ItemsPage />}
        </div>
      </div>

      {/* GLOBAL ADD ITEM MODAL */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAddItem={(item) => {
            console.log("Item added:", item);
          }}
        />
      )}
    </div>
  );
}
