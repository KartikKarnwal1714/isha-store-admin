import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import adminApi from "../api/client";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  const fetchCustomer = async () => {
    try {
      const res = await adminApi.get(
        "/users/customers"
      );

      const found = res.data.users.find(
        (user) => user._id === id
      );

      setCustomer(found);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  if (!customer) {
    return (
      <div className="p-10">
        Loading customer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <Link
        to="/customers"
        className="text-blue-600 font-bold"
      >
        ← Back to Customers
      </Link>

      <h1 className="text-3xl sm:text-4xl font-black mt-6 mb-8">
        Customer Details
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow">
          <h2 className="text-2xl font-black mb-4">
            Profile
          </h2>

          <p><b>Name:</b> {customer.name}</p>
          <p><b>Phone:</b> {customer.phone}</p>
          <p><b>Email:</b> {customer.email}</p>
          <p><b>City:</b> {customer.city}</p>
          <p><b>State:</b> {customer.state}</p>
          <p><b>Pincode:</b> {customer.pincode}</p>
          <p><b>Address:</b> {customer.address}</p>
          <p><b>Landmark:</b> {customer.landmark}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <h2 className="text-2xl font-black mb-4">
            Summary
          </h2>

          <p><b>Wishlist Items:</b> {customer.wishlist?.length || 0}</p>
          <p><b>Cart Items:</b> {customer.cart?.length || 0}</p>
          <p><b>Total Orders:</b> {customer.orders?.length || 0}</p>
        </div>
      </div>

      <Section title="Wishlist Products" items={customer.wishlist} />

      <Section
        title="Cart Products"
        items={customer.cart?.map((item) => item.product)}
      />

      <div className="bg-white p-6 rounded-3xl shadow mt-8">
        <h2 className="text-2xl font-black mb-4">
          Orders
        </h2>

        {customer.orders?.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="space-y-4">
            {customer.orders.map((order) => (
              <div
                key={order._id}
                className="border p-4 rounded-2xl"
              >
                <p><b>Order ID:</b> {order._id}</p>
                <p><b>Status:</b> {order.orderStatus}</p>
                <p><b>Total:</b> ₹{order.total}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow mt-8">
      <h2 className="text-2xl font-black mb-4">
        {title}
      </h2>

      {!items || items.length === 0 ? (
        <p>No items</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((product) => (
            <div
              key={product?._id}
              className="border rounded-2xl p-4"
            >
              <img
                src={
                  product?.colors?.[0]?.images?.[0] ||
                  product?.images?.[0] ||
                  product?.image ||
                  "https://via.placeholder.com/200"
                }
                alt=""
                className="w-full h-40 object-cover rounded-xl"
              />

              <h3 className="font-bold mt-3">
                {product?.name || product?.title || "Product"}
              </h3>

              <p className="text-gray-500">
                ₹{product?.price || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}