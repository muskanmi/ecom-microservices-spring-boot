import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

function StatCard({ label, value, description }) {
  return (
    <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
        {label}
      </p>

      <p className="mt-5 font-serif text-3xl text-[#233636]">{value}</p>

      <p className="mt-3 text-xs text-[#8A8378]">{description}</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Page intro */}
      <div className="mb-10">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
          Seller Console / Overview
        </p>

        <h1 className="font-serif text-4xl text-[#233636]">Dashboard</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
          Manage your marketplace catalogue, orders and seller operations from
          one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value="—"
          description="Products in your catalogue"
        />

        <StatCard
          label="Total Orders"
          value="—"
          description="Orders received"
        />

        <StatCard label="Revenue" value="—" description="Total sales revenue" />

        <StatCard
          label="Pending Orders"
          value="—"
          description="Orders awaiting action"
        />
      </div>

      {/* Main panels */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Activity
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Recent Orders
              </h2>
            </div>

            <span className="text-xs text-[#8A8378]">Latest</span>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="font-serif text-lg text-[#2D3A3A]">
              No recent orders
            </p>

            <p className="mt-2 text-sm text-[#8A8378]">
              Order activity will appear here.
            </p>
          </div>
        </section>

        {/* Catalog */}
        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Catalog Snapshot
              </h2>
            </div>

            <span className="text-xs text-[#8A8378]">Products</span>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="font-serif text-lg text-[#2D3A3A]">Your catalogue</p>

            <p className="mt-2 text-sm text-[#8A8378]">
              Product information will appear here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
