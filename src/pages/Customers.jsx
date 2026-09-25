import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import adminApi from "../api/client";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await adminApi.get("/users/customers");

      setCustomers(res.data.users || []);
    } catch (error) {
      console.log("Customer fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete ${customer.name || customer.phone}? This removes their account, ` +
        `addresses, cart and wishlist permanently. Their past orders and your ` +
        `revenue/sales figures are not affected and will stay exactly as they are.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(customer._id);

      await adminApi.delete(`/users/customers/${customer._id}`);

      setCustomers((current) =>
        current.filter((item) => item._id !== customer._id)
      );
    } catch (error) {
      console.log("Delete customer error:", error);

      alert(
        error.response?.data?.message ||
          "Customer could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getDefaultAddress = (user) => {
    return (
      user.addresses?.find((entry) => entry.isDefault) ||
      user.addresses?.[0] ||
      null
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Customers
          </h1>

          <p className="text-gray-500 mt-2">
            View all registered customers, their cart, wishlist and orders.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={customers.length}
        />

        <StatCard
          title="Total Wishlist Items"
          value={customers.reduce(
            (sum, user) => sum + (user.wishlist?.length || 0),
            0
          )}
        />

        <StatCard
          title="Total Cart Items"
          value={customers.reduce(
            (sum, user) => sum + (user.cart?.length || 0),
            0
          )}
        />

        <StatCard
          title="Total Orders"
          value={customers.reduce(
            (sum, user) => sum + (user.orders?.length || 0),
            0
          )}
        />
      </div>

      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No customers found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Address</th>
                <th className="p-4">Wishlist</th>
                <th className="p-4">Cart</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((user) => {
                const defaultAddress = getDefaultAddress(user);

                return (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <p className="font-black">
                        {user.name || "Not Added"}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {user._id}
                      </p>
                    </td>

                    <td className="p-4">
                      {user.phone || "Not Added"}
                    </td>

                    <td className="p-4">
                      {user.email || "Not Added"}
                    </td>

                    <td className="p-4 max-w-[320px] text-sm">
                      {defaultAddress ? (
                        <>
                          {defaultAddress.house}
                          {defaultAddress.city &&
                            `, ${defaultAddress.city}`}
                          {defaultAddress.state &&
                            `, ${defaultAddress.state}`}
                          {defaultAddress.pincode &&
                            ` - ${defaultAddress.pincode}`}
                        </>
                      ) : (
                        "Not Added"
                      )}
                    </td>

                    <td className="p-4 font-bold">
                      {user.wishlist?.length || 0}
                    </td>

                    <td className="p-4 font-bold">
                      {user.cart?.length || 0}
                    </td>

                    <td className="p-4 font-bold">
                      {user.orders?.length || 0}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/customers/${user._id}`}
                          className="bg-black text-white px-5 py-2 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user._id}
                          className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {deletingId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow">
      <p className="text-gray-500 font-medium text-sm sm:text-base">
        {title}
      </p>

      <h2 className="text-2xl sm:text-4xl font-black mt-3">
        {value}
      </h2>
    </div>
  );
}
