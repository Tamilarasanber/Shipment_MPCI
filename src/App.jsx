import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import DubaiMPCI from "@/pages/DubaiMPCI/DubaiMPCI";
import DubaiMPCIFiling from "@/pages/DubaiMPCI/DubaiMPCIFiling";

function ToastHost() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const onToast = (event) => {
      setToast(event.detail);
      window.clearTimeout(onToast.timer);
      onToast.timer = window.setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener("shipment-mpci-toast", onToast);
    return () => window.removeEventListener("shipment-mpci-toast", onToast);
  }, []);

  if (!toast?.message) return null;
  const tone = toast.severity === "error" ? "bg-red-600" : "bg-emerald-600";
  return (
    <div className={`fixed bottom-4 right-4 z-[70] max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${tone}`}>
      {toast.message}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="flex items-center justify-between bg-[#0b1f4d] px-6 py-3 text-white">
        <div className="text-lg font-semibold tracking-wide">newage</div>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/uae-mpci"
            className={({ isActive }) => (isActive ? "border-b-2 border-white pb-1" : "opacity-80")}
          >
            UAE MPCI
          </NavLink>
        </nav>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs">N</div>
      </header>
      <Routes>
        <Route path="/" element={<DubaiMPCI />} />
        <Route path="/uae-mpci" element={<DubaiMPCI />} />
        <Route path="/uae-mpci/filing" element={<DubaiMPCIFiling />} />
        <Route path="/uae-mpci/filing/:masterId" element={<DubaiMPCIFiling />} />
      </Routes>
      <ToastHost />
    </div>
  );
}
