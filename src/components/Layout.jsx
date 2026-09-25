import { Link } from "react-router-dom";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

import Navbar from "./Navbar";


export default function Layout({
  children,
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (

    <div className="min-h-screen flex bg-gray-100">

      {/* MOBILE SIDEBAR OVERLAY */}

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}

      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-black text-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between mb-12">

          <h1 className="text-3xl sm:text-4xl font-bold">

            ADMIN

          </h1>

          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden text-white text-2xl p-2 -mr-2"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>

        <div
          className="flex flex-col gap-4"
          onClick={closeSidebar}
        >

          <Link
            to="/"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Dashboard

          </Link>

          <Link
            to="/products"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Products

          </Link>

          <Link
            to="/add-product"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Add Product

          </Link>

          <Link 
            to="/upload-products"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
            >

              Upload Products 

          </Link>

          <Link
            to="/add-brand"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Add Brand

          </Link>

          <Link
            to="/orders"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Orders

          </Link>

          <Link 
            to="/add-coupon"
            className="hover:bg-gray-800 p-4 rounded-xl transition"
          >

            Add Coupon
          </Link>

          <Link
  to="/customers"
  className="block px-5 py-4 rounded-xl hover:bg-gray-800 transition"
>
  Customers
</Link>

          <button
  onClick={() => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  }}
  className="bg-red-500 text-white px-4 py-3 rounded-xl"
>
  Logout
</button>

        </div>

      </div>

      {/* MAIN */}

      <div className="flex-1 p-3 sm:p-6 w-full min-w-0">

        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {children}

      </div>

    </div>
  );
}