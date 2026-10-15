import { useEffect, useMemo, useState } from "react";
import adminApi from "../api/client";
import Layout from "../components/Layout";

import {
  FaBox,
  FaCheck,
  FaClock,
  FaEye,
  FaFilter,
  FaPrint,
  FaRedo,
  FaSearch,
  FaShippingFast,
  FaTimes,
  FaTrash,
  FaUndo,
  FaUser,
} from "react-icons/fa";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",

  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Returned",

  "Exchange Requested",
  "Exchange Approved",
  "Exchange Rejected",
  "Exchange Product Received",
  "Exchange Shipped",
  "Exchange Delivered",
];

const NORMAL_TRACKING_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const RETURN_TRACKING_STEPS = [
  "Return Requested",
  "Return Approved",
  "Returned",
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] =
    useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");
  const [statusMessage, setStatusMessage] =
    useState("");

    const [courierCompany, setCourierCompany] =
  useState("");

  const [deliveryOtp, setDeliveryOtp] =
  useState("");

const [otpGenerating, setOtpGenerating] =
  useState(false);

const [otpVerifying, setOtpVerifying] =
  useState(false);

const [trackingNumber, setTrackingNumber] =
  useState("");

const [trackingUrl, setTrackingUrl] =
  useState("");

const [estimatedDelivery, setEstimatedDelivery] =
  useState("");

  // =====================================================
  // FETCH ALL ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get(
  "/orders/all"
);

      const receivedOrders = Array.isArray(
        response.data
      )
        ? response.data
        : Array.isArray(response.data?.orders)
        ? response.data.orders
        : [];

      setOrders(receivedOrders);
    } catch (requestError) {
      console.error(
        "Fetch orders error:",
        requestError.response?.data ||
          requestError.message
      );

      setOrders([]);

      setError(
        requestError.response?.data?.message ||
          "Orders could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" ||
        order.orderStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const searchableText = [
        order._id,
        order.customerName,
        order.customerPhone,
        order.phone,
        order.email,
        order.customerId?.name,
        order.customerId?.phone,
        order.customerId?.email,
        order.orderStatus,
        order.paymentStatus,
        order.couponCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanSearch);
    });
  }, [orders, search, statusFilter]);

  // =====================================================
  // ANALYTICS
  // =====================================================

  const analytics = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter((order) =>
        [
          "Pending",
          "Confirmed",
          "Processing",
          "Packed",
        ].includes(order.orderStatus)
      ).length,

      shipped: orders.filter((order) =>
        [
          "Shipped",
          "Out for Delivery",
        ].includes(order.orderStatus)
      ).length,

      delivered: orders.filter(
        (order) =>
          order.orderStatus === "Delivered"
      ).length,

      returns: orders.filter((order) =>
        [
          "Return Requested",
          "Return Approved",
        ].includes(order.orderStatus)
      ).length,

      revenue: orders
        .filter(
          (order) =>
            order.paymentStatus === "Paid" ||
            order.paymentStatus === "Refund Pending"
        )
        .reduce(
          (sum, order) =>
            sum + Number(order.total || 0),
          0
        ),
    };
  }, [orders]);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortOrderId = (orderId) => {
    return String(orderId || "")
      .slice(-8)
      .toUpperCase();
  };

  const getProductImage = (item) => {
    return (
      item.image ||
      item.productId?.colors?.[0]?.images?.[0] ||
      item.productId?.image ||
      "https://via.placeholder.com/300x300?text=No+Image"
    );
  };

  const getStatusClass = (status) => {
    const classes = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Processing:
        "bg-indigo-100 text-indigo-800",
      Packed: "bg-purple-100 text-purple-800",
      Shipped: "bg-cyan-100 text-cyan-800",
      "Out for Delivery":
        "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      "Return Requested":
        "bg-orange-100 text-orange-800",
      "Return Approved":
        "bg-blue-100 text-blue-800",
      "Return Rejected":
        "bg-red-100 text-red-800",
      Returned: "bg-gray-200 text-gray-800",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700"
    );
  };

  const getPaymentStatusClass = (status) => {
    const classes = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      "Refund Pending":
        "bg-orange-100 text-orange-800",
      Refunded: "bg-blue-100 text-blue-800",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700"
    );
  };

  // =====================================================
  // OPEN ORDER DETAILS
  // =====================================================

  const openOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await adminApi.get(
  `/orders/${orderId}`
);

      const order =
        response.data?.order || response.data;

      setSelectedOrder(order);

setSelectedStatus(order.orderStatus || "");

setStatusMessage("");

setCourierCompany(order.courierCompany || "");

setTrackingNumber(order.trackingNumber || "");

setTrackingUrl(order.trackingUrl || "");

setEstimatedDelivery(
  order.estimatedDelivery
    ? new Date(order.estimatedDelivery)
        .toISOString()
        .slice(0, 10)
    : ""
);

    } catch (requestError) {
      console.error(
        "Order details error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Order details could not be loaded."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeOrderDetails = () => {
    if (updating) {
      return;
    }

    setSelectedOrder(null);

setSelectedStatus("");

setStatusMessage("");

setCourierCompany("");

setTrackingNumber("");

setTrackingUrl("");

setEstimatedDelivery("");

  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const updateOrderStatus = async () => {
    const generateDeliveryOtp = async () => {
  if (!selectedOrder?._id) return;

  try {
    setOtpGenerating(true);

    const response = await adminApi.post(
      `/orders/generate-delivery-otp/${selectedOrder._id}`
    );

    setSuccess(response.data.message);

    alert(
      `OTP (Testing): ${response.data.otp}`
    );

    openOrderDetails(selectedOrder._id);

  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to generate OTP."
    );
  } finally {
    setOtpGenerating(false);
  }
};

const verifyDeliveryOtp = async () => {
  if (!deliveryOtp.trim()) {
    setError("Enter OTP.");

    return;
  }

  try {
    setOtpVerifying(true);

    const response = await adminApi.post(
      `/orders/verify-delivery-otp/${selectedOrder._id}`,
      {
        otp: deliveryOtp,
      }
    );

    setSelectedOrder(response.data.order);

    setOrders((previous) =>
      previous.map((order) =>
        order._id === response.data.order._id
          ? response.data.order
          : order
      )
    );

    setDeliveryOtp("");

    setSuccess(response.data.message);

  } catch (error) {
    setError(
      error.response?.data?.message ||
      "OTP verification failed."
    );
  } finally {
    setOtpVerifying(false);
  }
};


    if (!selectedOrder?._id) {
      return;
    }

    if (!selectedStatus) {
      setError("Please select an order status.");
      return;
    }

    if (
  selectedStatus === "Delivered" &&
  !selectedOrder.deliveryOtpVerified
) {
  setError(
    "Verify the delivery OTP before marking this order as Delivered."
  );

  return;
}

    if (
      selectedStatus === selectedOrder.orderStatus
    ) {
      setError(
        "Please select a different order status."
      );
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await adminApi.put(
  `/orders/update-status/${selectedOrder._id}`,
  {
    orderStatus: selectedStatus,
    message: statusMessage.trim(),

    courierCompany,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
  }
);

      const updatedOrder =
        response.data?.order || response.data;

      setSelectedOrder(updatedOrder);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === updatedOrder._id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
        )
      );

      setStatusMessage("");

      setSuccess(
        response.data?.message ||
          `Order updated to ${selectedStatus}.`
      );
    } catch (requestError) {
      console.error(
        "Update order status error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Order status could not be updated."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // QUICK RETURN ACTIONS
  // =====================================================

  const handleReturnAction = async (
    status,
    defaultMessage
  ) => {
    if (!selectedOrder?._id) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await adminApi.put(
 `/orders/update-status/${selectedOrder._id}`,
        {
          orderStatus: status,
          message:
            statusMessage.trim() || defaultMessage,
        }
      );

      const updatedOrder =
        response.data?.order || response.data;

      setSelectedOrder(updatedOrder);
      setSelectedStatus(updatedOrder.orderStatus);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === updatedOrder._id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
        )
      );

      setStatusMessage("");

      setSuccess(
        response.data?.message ||
          `Return updated to ${status}.`
      );
    } catch (requestError) {
      console.error(
        "Return action error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Return action could not be completed."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // DELETE ORDER
  // =====================================================

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(orderId);
      setError("");
      setSuccess("");

      const response = await adminApi.delete(
 `/orders/delete/${orderId}`
);

      setOrders((previousOrders) =>
        previousOrders.filter(
          (order) => order._id !== orderId
        )
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }

      setSuccess(
        response.data?.message ||
          "Order deleted successfully."
      );
    } catch (requestError) {
      console.error(
        "Delete order error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Order could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // PRINT INVOICE
  // =====================================================

  const printInvoice = async () => {
  if (!selectedOrder?._id) {
    return;
  }

  try {
    setError("");

    const response = await adminApi.get(
 `/orders/${selectedOrder._id}/invoice`,
{
    responseType:"blob"
}
);

    const pdfBlob = new Blob(
      [response.data],
      {
        type: "application/pdf",
      }
    );

    const downloadUrl =
      window.URL.createObjectURL(
        pdfBlob
      );

    const downloadLink =
      document.createElement("a");

    downloadLink.href = downloadUrl;

    downloadLink.download =
      `Invoice-${getShortOrderId(
        selectedOrder._id
      )}.pdf`;

    document.body.appendChild(
      downloadLink
    );

    downloadLink.click();
    downloadLink.remove();

    window.URL.revokeObjectURL(
      downloadUrl
    );

    setSuccess(
      "Invoice downloaded successfully."
    );
  } catch (requestError) {
    console.error(
      "Admin invoice error:",
      requestError
    );

    setError(
      requestError.response?.data?.message ||
        "Invoice could not be downloaded."
    );
  }
};

  // =====================================================
  // TRACKING TIMELINE
  // =====================================================

  const renderTrackingTimeline = () => {
    if (!selectedOrder) {
      return null;
    }

    const currentIndex =
      NORMAL_TRACKING_STEPS.indexOf(
        selectedOrder.orderStatus
      );

    return (
      <div className="mt-7">
        <h3 className="text-xl font-black mb-5">
          Delivery Timeline
        </h3>

        <div className="space-y-0">
          {NORMAL_TRACKING_STEPS.map(
            (step, index) => {
              const historyEntry =
                selectedOrder.statusHistory?.find(
                  (entry) =>
                    entry.status === step
                );

              const completed =
                currentIndex >= index;

              const active =
                selectedOrder.orderStatus === step;

              return (
                <div
                  key={step}
                  className="relative flex gap-4 pb-7 last:pb-0"
                >
                  {index <
                    NORMAL_TRACKING_STEPS.length -
                      1 && (
                    <div
                      className={`absolute left-[17px] top-9 h-full w-[2px] ${
                        completed
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      completed
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    } ${
                      active
                        ? "ring-4 ring-green-100"
                        : ""
                    }`}
                  >
                    {completed ? (
                      <FaCheck size={13} />
                    ) : (
                      <FaClock size={12} />
                    )}
                  </div>

                  <div>
                    <p
                      className={`font-bold ${
                        active
                          ? "text-green-700"
                          : completed
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </p>

                    {historyEntry && (
                      <>
                        <p className="text-sm text-gray-500 mt-1">
                          {historyEntry.message}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(
                            historyEntry.date
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  };

  const renderReturnTimeline = () => {
    if (
      !selectedOrder ||
      (!selectedOrder.returnRequested &&
        !RETURN_TRACKING_STEPS.includes(
          selectedOrder.orderStatus
        ) &&
        selectedOrder.orderStatus !==
          "Return Rejected")
    ) {
      return null;
    }

    const currentIndex =
      RETURN_TRACKING_STEPS.indexOf(
        selectedOrder.orderStatus
      );

    return (
      <div className="mt-8 pt-7 border-t">
        <h3 className="text-xl font-black mb-5">
          Return Timeline
        </h3>

        {selectedOrder.orderStatus ===
        "Return Rejected" ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl">
            Return request rejected.
          </div>
        ) : (
          <div>
            {RETURN_TRACKING_STEPS.map(
              (step, index) => {
                const historyEntry =
                  selectedOrder.statusHistory?.find(
                    (entry) =>
                      entry.status === step
                  );

                const completed =
                  currentIndex >= index;

                return (
                  <div
                    key={step}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    {index <
                      RETURN_TRACKING_STEPS.length -
                        1 && (
                      <div
                        className={`absolute left-[17px] top-9 h-full w-[2px] ${
                          completed
                            ? "bg-blue-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        completed
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {completed ? (
                        <FaCheck size={13} />
                      ) : (
                        <FaClock size={12} />
                      )}
                    </div>

                    <div>
                      <p className="font-bold">
                        {step}
                      </p>

                      {historyEntry && (
                        <>
                          <p className="text-sm text-gray-500 mt-1">
                            {historyEntry.message}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(
                              historyEntry.date
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-7">
        {/* PAGE HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black">
              Order Management
            </h1>

            <p className="text-gray-500 mt-2">
              Manage deliveries, returns, refunds and
              customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            <FaRedo
              className={loading ? "animate-spin" : ""}
            />

            Refresh Orders
          </button>
        </div>

        {/* MESSAGES */}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex justify-between gap-4">
            <p className="font-semibold">{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex justify-between gap-4">
            <p className="font-semibold">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ANALYTICS */}

        <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <AnalyticsCard
            title="Total Orders"
            value={analytics.total}
            icon={<FaBox />}
          />

          <AnalyticsCard
            title="In Progress"
            value={analytics.pending}
            icon={<FaClock />}
          />

          <AnalyticsCard
            title="Shipping"
            value={analytics.shipped}
            icon={<FaShippingFast />}
          />

          <AnalyticsCard
            title="Delivered"
            value={analytics.delivered}
            icon={<FaCheck />}
          />

          <AnalyticsCard
            title="Returns"
            value={analytics.returns}
            icon={<FaUndo />}
          />

          <AnalyticsCard
            title="Revenue"
            value={`₹${formatPrice(
              analytics.revenue
            )}`}
            icon={<FaUser />}
          />
        </div>

        {/* FILTERS */}

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <div className="grid md:grid-cols-[1fr_250px_auto] gap-4">
            <div className="border rounded-xl flex items-center px-4">
              <FaSearch className="text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order ID, customer, phone or email..."
                className="w-full px-4 py-3 outline-none"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="border rounded-xl flex items-center px-4">
              <FaFilter className="text-gray-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 outline-none bg-white"
              >
                <option value="All">
                  All Statuses
                </option>

                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="border px-5 py-3 rounded-xl hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ORDERS TABLE */}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-black rounded-full animate-spin" />

              <p className="font-bold mt-5">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center">
              <FaBox className="text-6xl text-gray-300 mx-auto" />

              <h2 className="text-2xl font-black mt-5">
                No Orders Found
              </h2>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <p className="font-black">
                          #
                          {getShortOrderId(
                            order._id
                          )}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold">
                          {order.customerName ||
                            order.customerId?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {order.email ||
                            order.customerId?.email ||
                            ""}
                        </p>
                      </td>

                      <td className="p-4">
                        {order.phone ||
                          order.customerPhone ||
                          order.customerId?.phone ||
                          "-"}
                      </td>

                      <td className="p-4">
                        {order.products?.length || 0}
                      </td>

                      <td className="p-4 font-black">
                        ₹{formatPrice(order.total)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getPaymentStatusClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus ||
                            "Pending"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openOrderDetails(
                                order._id
                              )
                            }
                            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800"
                            title="View Order"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteOrder(order._id)
                            }
                            disabled={
                              deletingId === order._id
                            }
                            className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-50"
                            title="Delete Order"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}

      {(selectedOrder || detailsLoading) && (
        <div className="fixed inset-0 z-[5000] bg-black/60 flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full overflow-y-auto shadow-2xl">
            {detailsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div>
                  <div className="w-14 h-14 mx-auto border-4 border-gray-200 border-t-black rounded-full animate-spin" />

                  <p className="font-bold mt-5">
                    Loading order details...
                  </p>
                </div>
              </div>
            ) : (
              selectedOrder && (
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h2 className="text-3xl font-black">
                        Order #
                        {getShortOrderId(
                          selectedOrder._id
                        )}
                      </h2>

                      <p className="text-gray-500 mt-2">
                        {formatDate(
                          selectedOrder.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeOrderDetails}
                      className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-black hover:text-white"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* STATUS */}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span
                      className={`px-4 py-2 rounded-full font-bold ${getStatusClass(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>

                    <span
                      className={`px-4 py-2 rounded-full font-bold ${getPaymentStatusClass(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      Payment:{" "}
                      {selectedOrder.paymentStatus ||
                        "Pending"}
                    </span>
                  </div>

                  {/* CUSTOMER */}

                  <Section title="Customer Details">
                    <InfoRow
                      label="Name"
                      value={
                        selectedOrder.customerName ||
                        selectedOrder.customerId?.name
                      }
                    />

                    <InfoRow
                      label="Phone"
                      value={
                        selectedOrder.phone ||
                        selectedOrder.customerPhone ||
                        selectedOrder.customerId?.phone
                      }
                    />

                    <InfoRow
                      label="Email"
                      value={
                        selectedOrder.email ||
                        selectedOrder.customerId?.email
                      }
                    />
                  </Section>

                  {/* ADDRESS */}

                  <Section title="Shipping Address">
                    <p className="text-gray-700 leading-7">
                      {selectedOrder.address?.house ||
                        "-"}
                      <br />

                      {selectedOrder.address?.city ||
                        ""}
                      {selectedOrder.address?.city &&
                      selectedOrder.address?.state
                        ? ", "
                        : ""}
                      {selectedOrder.address?.state ||
                        ""}
                      <br />

                      {selectedOrder.address?.pincode ||
                        ""}

                      {selectedOrder.address?.landmark && (
                        <>
                          <br />
                          Landmark:{" "}
                          {
                            selectedOrder.address
                              .landmark
                          }
                        </>
                      )}
                    </p>
                  </Section>

                  {/* PRODUCTS */}

                  <Section title="Products">
                    <div className="space-y-4">
                      {(selectedOrder.products || []).map(
                        (item, index) => (
                          <div
                            key={
                              item._id ||
                              item.productId?._id ||
                              index
                            }
                            className="border rounded-2xl p-4 flex gap-4"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={
                                item.name || "Product"
                              }
                              className="w-24 h-24 object-cover rounded-xl bg-gray-100"
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://via.placeholder.com/300x300?text=No+Image";
                              }}
                            />

                            <div className="flex-1">
                              <h4 className="font-black text-lg">
                                {item.name}
                              </h4>

                              <p className="text-sm text-gray-500 mt-1">
                                Size:{" "}
                                {item.size || "-"} |
                                Color:{" "}
                                {item.color || "-"}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Quantity:{" "}
                                {item.quantity || 1}
                              </p>

                              <p className="font-black mt-2">
                                ₹
                                {formatPrice(
                                  Number(
                                    item.price || 0
                                  ) *
                                    Number(
                                      item.quantity ||
                                        1
                                    )
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Section>

                  {/* PRICE SUMMARY */}

                  <Section title="Payment Summary">
                    <InfoRow
                      label="Subtotal"
                      value={`₹${formatPrice(
                        selectedOrder.subtotal
                      )}`}
                    />

                    <InfoRow
                      label="Shipping"
                      value={`₹${formatPrice(
                        selectedOrder.shipping
                      )}`}
                    />

                    <InfoRow
                      label="Tax"
                      value={`₹${formatPrice(
                        selectedOrder.tax
                      )}`}
                    />

                    <InfoRow
                      label="Discount"
                      value={`-₹${formatPrice(
                        selectedOrder.discount
                      )}`}
                    />

                    <div className="border-t mt-4 pt-4 flex justify-between text-xl font-black">
                      <span>Total</span>

                      <span>
                        ₹
                        {formatPrice(
                          selectedOrder.total
                        )}
                      </span>
                    </div>
                  </Section>

                  {/* RETURN REQUEST */}

                  {selectedOrder.returnRequested && (
                    <Section title="Return Request">
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                        <InfoRow
                          label="Reason"
                          value={
                            selectedOrder.returnReason
                          }
                        />

                        <InfoRow
                          label="Description"
                          value={
                            selectedOrder.returnDescription
                          }
                        />

                        <InfoRow
                          label="Requested"
                          value={formatDate(
                            selectedOrder.returnRequestedAt
                          )}
                        />
                      </div>

                      {selectedOrder.orderStatus ===
                        "Return Requested" && (
                        <div className="mt-5">
                          <label className="block font-bold mb-2">
                            Admin note
                          </label>

                          <textarea
                            rows="4"
                            value={statusMessage}
                            onChange={(event) =>
                              setStatusMessage(
                                event.target.value
                              )
                            }
                            placeholder="Optional approval or rejection note..."
                            className="w-full border rounded-xl p-4 outline-none"
                          />

                          <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleReturnAction(
                                  "Return Approved",
                                  "Return request approved by admin"
                                )
                              }
                              disabled={updating}
                              className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve Return
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleReturnAction(
                                  "Return Rejected",
                                  "Return request rejected by admin"
                                )
                              }
                              disabled={updating}
                              className="bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject Return
                            </button>
                          </div>
                        </div>
                      )}
                    </Section>
                  )}

                  {/* UPDATE STATUS */}

                  <Section title="Update Order Status">
                    <select
                      value={selectedStatus}
                      onChange={(event) =>
                        setSelectedStatus(
                          event.target.value
                        )
                      }
                      className="w-full border rounded-xl p-4 outline-none bg-white"
                    >
                      {ORDER_STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>

                    {selectedStatus === "Shipped" && (
  <div className="space-y-4 mt-5">

    <div>
      <label className="block font-semibold mb-2">
        Courier Company
      </label>

      <input
        type="text"
        value={courierCompany}
        onChange={(e) =>
          setCourierCompany(e.target.value)
        }
        placeholder="Delhivery, Blue Dart, DTDC..."
        className="w-full border rounded-xl p-4 outline-none"
      />
    </div>

    <div>
      <label className="block font-semibold mb-2">
        Tracking Number
      </label>

      <input
        type="text"
        value={trackingNumber}
        onChange={(e) =>
          setTrackingNumber(e.target.value)
        }
        placeholder="Enter tracking number"
        className="w-full border rounded-xl p-4 outline-none"
      />
    </div>

    <div>
      <label className="block font-semibold mb-2">
        Tracking URL
      </label>

      <input
        type="text"
        value={trackingUrl}
        onChange={(e) =>
          setTrackingUrl(e.target.value)
        }
        placeholder="https://..."
        className="w-full border rounded-xl p-4 outline-none"
      />
    </div>

    <div>
      <label className="block font-semibold mb-2">
        Estimated Delivery
      </label>

      <input
        type="date"
        value={estimatedDelivery}
        onChange={(e) =>
          setEstimatedDelivery(e.target.value)
        }
        className="w-full border rounded-xl p-4 outline-none"
      />
    </div>

  </div>
)}

                    <textarea
                      rows="3"
                      value={statusMessage}
                      onChange={(event) =>
                        setStatusMessage(
                          event.target.value
                        )
                      }
                      placeholder="Optional message for the customer..."
                      className="w-full border rounded-xl p-4 outline-none mt-4"
                    />

                    <button
                      type="button"
                      onClick={updateOrderStatus}
                      disabled={updating}
                      className="w-full mt-4 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "Update Order Status"}
                    </button>
                  </Section>

                  {/* TIMELINE */}

                  <Section title="Tracking">
                    {renderTrackingTimeline()}
                    {renderReturnTimeline()}
                  </Section>

                  {/* ACTIONS */}

                  <div className="grid sm:grid-cols-2 gap-3 mt-7">
                    <button
                      type="button"
                      onClick={printInvoice}
                      className="flex items-center justify-center gap-2 border py-4 rounded-xl font-bold hover:bg-gray-100"
                    >
                      <FaPrint />
                      Print Invoice
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteOrder(
                          selectedOrder._id
                        )
                      }
                      disabled={
                        deletingId ===
                        selectedOrder._id
                      }
                      className="flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                      <FaTrash />
                      Delete Order
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function AnalyticsCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
        {icon}
      </div>

      <p className="text-sm text-gray-500 mt-4">
        {title}
      </p>

      <h3 className="text-2xl font-black mt-1">
        {value}
      </h3>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-7 border rounded-2xl p-5">
      <h3 className="text-xl font-black mb-5">
        {title}
      </h3>

      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-5 py-2">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-semibold text-right">
        {value || "-"}
      </span>
    </div>
  );
}