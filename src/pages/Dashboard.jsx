import { useEffect, useMemo, useState } from "react";
import adminApi from "../api/client";
import Layout from "../components/Layout";


// ======================================================
// HELPERS
// ======================================================

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number(value || 0)
  );
}

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderStatusClasses(status) {
  const statusClasses = {
    Pending:
      "bg-yellow-100 text-yellow-700 border-yellow-200",

    Confirmed:
      "bg-blue-100 text-blue-700 border-blue-200",

    Processing:
      "bg-indigo-100 text-indigo-700 border-indigo-200",

    Packed:
      "bg-purple-100 text-purple-700 border-purple-200",

    Shipped:
      "bg-cyan-100 text-cyan-700 border-cyan-200",

    "Out for Delivery":
      "bg-orange-100 text-orange-700 border-orange-200",

    Delivered:
      "bg-green-100 text-green-700 border-green-200",

    Cancelled:
      "bg-red-100 text-red-700 border-red-200",

    "Return Requested":
      "bg-amber-100 text-amber-700 border-amber-200",

    "Return Approved":
      "bg-violet-100 text-violet-700 border-violet-200",

    "Return Rejected":
      "bg-rose-100 text-rose-700 border-rose-200",

    Returned:
      "bg-gray-200 text-gray-700 border-gray-300",
  };

  return (
    statusClasses[status] ||
    "bg-gray-100 text-gray-700 border-gray-200"
  );
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const fetchAnalytics = async (
    initialLoad = false
  ) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await adminApi.get(
  "/dashboard"
);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Dashboard analytics could not be loaded"
        );
      }

      setAnalytics(response.data);
    } catch (requestError) {
      console.error(
        "Dashboard error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Dashboard analytics could not be loaded"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);
  }, []);

  const topSellingProducts =
    analytics?.topSellingProducts || [];

  const topCustomers =
    analytics?.topCustomers || [];

  const recentOrders =
    analytics?.recentOrders || [];

  const monthlySales =
    analytics?.monthlySales || [];

  const categoryData =
    analytics?.categoryAnalytics || [];

  const brandData =
    analytics?.brandAnalytics || [];

  const colorData =
    analytics?.colorAnalytics || [];

  const sizeData =
    analytics?.sizeAnalytics || [];

  const lowStockProducts =
    analytics?.lowStockProducts || [];

  const outOfStockProducts =
    analytics?.outOfStockProducts || [];

  const orderStatusAnalytics =
    analytics?.orderStatusAnalytics || [];

  const paymentAnalytics =
    analytics?.paymentAnalytics || {
      pending: 0,
      paid: 0,
      failed: 0,
      refundPending: 0,
      refunded: 0,
    };

  const maximumMonthlyRevenue = useMemo(
    () =>
      Math.max(
        ...monthlySales.map((item) =>
          Number(item.revenue || 0)
        ),
        1
      ),
    [monthlySales]
  );

  const maximumCategoryCount = useMemo(
    () =>
      Math.max(
        ...categoryData.map((item) =>
          Number(item.count || 0)
        ),
        1
      ),
    [categoryData]
  );

  const maximumStatusCount = useMemo(
    () =>
      Math.max(
        ...orderStatusAnalytics.map((item) =>
          Number(item.count || 0)
        ),
        1
      ),
    [orderStatusAnalytics]
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 border-t-black animate-spin" />

            <h2 className="text-2xl font-black mt-5">
              Loading Dashboard
            </h2>

            <p className="text-gray-500 mt-2">
              Preparing sales and inventory
              analytics...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white rounded-[30px] p-7 md:p-9 shadow-xl">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <p className="text-gray-300 text-sm uppercase tracking-[4px] font-bold">
                Business overview
              </p>

              <h1 className="text-3xl md:text-5xl font-black mt-3">
                Ecommerce Dashboard
              </h1>

              <p className="text-gray-300 mt-4 max-w-3xl leading-7">
                Track revenue, orders, customers,
                inventory, returns and product
                performance from one dashboard.
              </p>

              {analytics?.generatedAt && (
                <p className="text-gray-400 text-sm mt-4">
                  Last updated:{" "}
                  {formatDateTime(
                    analytics.generatedAt
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                fetchAnalytics(false)
              }
              disabled={refreshing}
              className="bg-white text-black px-7 py-4 rounded-2xl font-black hover:bg-gray-100 transition disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchAnalytics(false)
              }
              className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ==================================================
            MAIN BUSINESS CARDS
        ================================================== */}

        <section>
          <SectionHeading
            title="Business Summary"
            subtitle="Important sales and order metrics"
          />

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(
                analytics?.totalRevenue
              )}
              subtitle="Valid non-cancelled orders"
              badge="Lifetime"
            />

            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(
                analytics?.monthlyRevenue
              )}
              subtitle="Revenue in current month"
              badge="This Month"
            />

            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(
                analytics?.todaysRevenue
              )}
              subtitle={`${formatNumber(
                analytics?.todaysOrders
              )} orders placed today`}
              badge="Today"
            />

            <MetricCard
              title="Average Order Value"
              value={formatCurrency(
                analytics?.averageOrderValue
              )}
              subtitle="Revenue divided by valid orders"
              badge="AOV"
            />
          </div>
        </section>

        {/* ==================================================
            ORDER CARDS
        ================================================== */}

        <section>
          <SectionHeading
            title="Order Performance"
            subtitle="Live order-status information"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            <SmallMetricCard
              title="Total Orders"
              value={analytics?.totalOrders}
            />

            <SmallMetricCard
              title="Pending"
              value={analytics?.pendingOrders}
            />

            <SmallMetricCard
              title="Delivered"
              value={analytics?.deliveredOrders}
            />

            <SmallMetricCard
              title="Cancelled"
              value={analytics?.cancelledOrders}
            />

            <SmallMetricCard
              title="Return Requests"
              value={
                analytics?.returnRequestedOrders
              }
            />

            <SmallMetricCard
              title="Returned"
              value={analytics?.returnedOrders}
            />
          </div>
        </section>

        {/* ==================================================
            RATE CARDS
        ================================================== */}

        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <RateCard
              title="Cancellation Rate"
              value={
                analytics?.cancellationRate || 0
              }
              description="Percentage of all orders that were cancelled."
            />

            <RateCard
              title="Return Rate"
              value={analytics?.returnRate || 0}
              description="Percentage of delivered orders that were returned."
            />
          </div>
        </section>

        {/* ==================================================
            INVENTORY CARDS
        ================================================== */}

        <section>
          <SectionHeading
            title="Inventory Summary"
            subtitle="Product, brand and stock information"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            <SmallMetricCard
              title="Customers"
              value={analytics?.totalCustomers}
            />

            <SmallMetricCard
              title="Products"
              value={analytics?.totalProducts}
            />

            <SmallMetricCard
              title="Brands"
              value={analytics?.totalBrands}
            />

            <SmallMetricCard
              title="Total Stock"
              value={analytics?.totalStock}
            />

            <SmallMetricCard
              title="Low Stock"
              value={lowStockProducts.length}
            />

            <SmallMetricCard
              title="Out of Stock"
              value={outOfStockProducts.length}
            />
          </div>

          <div className="mt-5">
            <MetricCard
              title="Total Inventory Value"
              value={formatCurrency(
                analytics?.totalInventoryValue
              )}
              subtitle="Estimated value based on current stock and selling prices"
              badge="Inventory"
            />
          </div>
        </section>

        {/* ==================================================
            MONTHLY SALES AND ORDER STATUS
        ================================================== */}

        <section className="grid xl:grid-cols-2 gap-8">
          <DashboardPanel
            title="Monthly Revenue"
            subtitle="Current-year revenue and orders"
          >
            {monthlySales.length === 0 ? (
              <EmptyState text="No monthly sales data available." />
            ) : (
              <div className="space-y-5">
                {monthlySales.map((item) => {
                  const width =
                    maximumMonthlyRevenue > 0
                      ? Math.max(
                          (Number(
                            item.revenue || 0
                          ) /
                            maximumMonthlyRevenue) *
                            100,
                          item.revenue > 0
                            ? 4
                            : 0
                        )
                      : 0;

                  return (
                    <div
                      key={
                        item.monthNumber ??
                        item.month
                      }
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-black">
                          {item.month}
                        </span>

                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(
                              item.revenue
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatNumber(
                              item.orders
                            )}{" "}
                            orders
                          </p>
                        </div>
                      </div>

                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Order Status Distribution"
            subtitle="Number of orders at each stage"
          >
            {orderStatusAnalytics.length ===
            0 ? (
              <EmptyState text="No order-status data available." />
            ) : (
              <div className="space-y-5">
                {orderStatusAnalytics.map(
                  (item) => {
                    const width =
                      maximumStatusCount > 0
                        ? Math.max(
                            (Number(
                              item.count || 0
                            ) /
                              maximumStatusCount) *
                              100,
                            item.count > 0
                              ? 5
                              : 0
                          )
                        : 0;

                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span
                            className={`inline-flex border px-3 py-1 rounded-full text-sm font-bold ${getOrderStatusClasses(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          <p className="font-bold">
                            {formatNumber(
                              item.count
                            )}{" "}
                            orders ·{" "}
                            {formatPercentage(
                              item.percentage
                            )}
                          </p>
                        </div>

                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-800 rounded-full"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ==================================================
            PAYMENT ANALYTICS
        ================================================== */}

        <section>
          <SectionHeading
            title="Payment Analytics"
            subtitle="Payment and refund status"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <PaymentCard
              title="Pending"
              value={paymentAnalytics.pending}
            />

            <PaymentCard
              title="Paid"
              value={paymentAnalytics.paid}
            />

            <PaymentCard
              title="Failed"
              value={paymentAnalytics.failed}
            />

            <PaymentCard
              title="Refund Pending"
              value={
                paymentAnalytics.refundPending
              }
            />

            <PaymentCard
              title="Refunded"
              value={paymentAnalytics.refunded}
            />
          </div>
        </section>

        {/* ==================================================
            TOP PRODUCTS AND TOP CUSTOMERS
        ================================================== */}

        <section className="grid xl:grid-cols-2 gap-8">
          <DashboardPanel
            title="Top-Selling Products"
            subtitle="Products ranked by units sold"
          >
            {topSellingProducts.length === 0 ? (
              <EmptyState text="No product sales data available." />
            ) : (
              <div className="space-y-4">
                {topSellingProducts.map(
                  (product, index) => (
                    <div
                      key={
                        product.productId ||
                        `${product.name}-${index}`
                      }
                      className="flex items-center justify-between gap-4 border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black shrink-0">
                          {index + 1}
                        </div>

                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                        />

                        <div className="min-w-0">
                          <h3 className="font-black truncate">
                            {product.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {formatNumber(
                              product.quantity
                            )}{" "}
                            units ·{" "}
                            {formatNumber(
                              product.orderCount
                            )}{" "}
                            orders
                          </p>
                        </div>
                      </div>

                      <p className="font-black whitespace-nowrap">
                        {formatCurrency(
                          product.revenue
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Top Customers"
            subtitle="Customers ranked by total spending"
          >
            {topCustomers.length === 0 ? (
              <EmptyState text="No customer-sales data available." />
            ) : (
              <div className="space-y-4">
                {topCustomers.map(
                  (customer, index) => (
                    <div
                      key={
                        customer.customerId ||
                        `${customer.phone}-${index}`
                      }
                      className="flex items-center justify-between gap-4 border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shrink-0">
                          {String(
                            customer.name ||
                              "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black truncate">
                            {customer.name ||
                              "Customer"}
                          </h3>

                          <p className="text-sm text-gray-500 truncate">
                            {customer.phone ||
                              customer.email ||
                              "No contact details"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatNumber(
                              customer.orders
                            )}{" "}
                            valid orders
                          </p>
                        </div>
                      </div>

                      <p className="font-black whitespace-nowrap">
                        {formatCurrency(
                          customer.totalSpent
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ==================================================
            RECENT ORDERS
        ================================================== */}

        <section>
          <DashboardPanel
            title="Recent Orders"
            subtitle="Latest customer orders"
          >
            {recentOrders.length === 0 ? (
              <EmptyState text="No recent orders available." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left">
                        Order
                      </th>

                      <th className="p-4 text-left">
                        Customer
                      </th>

                      <th className="p-4 text-left">
                        Phone
                      </th>

                      <th className="p-4 text-left">
                        Amount
                      </th>

                      <th className="p-4 text-left">
                        Payment
                      </th>

                      <th className="p-4 text-left">
                        Status
                      </th>

                      <th className="p-4 text-left">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map(
                      (order) => (
                        <tr
                          key={order._id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-4 font-mono text-sm font-bold">
                            #
                            {String(
                              order._id
                            )
                              .slice(-8)
                              .toUpperCase()}
                          </td>

                          <td className="p-4 font-bold">
                            {order.customerName ||
                              "Customer"}
                          </td>

                          <td className="p-4">
                            {order.customerPhone ||
                              order.phone ||
                              "N/A"}
                          </td>

                          <td className="p-4 font-black">
                            {formatCurrency(
                              order.total
                            )}
                          </td>

                          <td className="p-4">
                            <div>
                              <p className="font-semibold">
                                {order.paymentMethod ||
                                  "COD"}
                              </p>

                              <p className="text-xs text-gray-500">
                                {order.paymentStatus ||
                                  "Pending"}
                              </p>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex border px-3 py-2 rounded-full text-xs font-bold ${getOrderStatusClasses(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>

                          <td className="p-4 text-gray-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ==================================================
            CATEGORY AND BRAND ANALYTICS
        ================================================== */}

        <section className="grid xl:grid-cols-2 gap-8">
          <DashboardPanel
            title="Category Analytics"
            subtitle="Product distribution by category"
          >
            {categoryData.length === 0 ? (
              <EmptyState text="No category data available." />
            ) : (
              <div className="space-y-5">
                {categoryData.map((item) => {
                  const width =
                    maximumCategoryCount > 0
                      ? Math.max(
                          (Number(
                            item.count || 0
                          ) /
                            maximumCategoryCount) *
                            100,
                          4
                        )
                      : 0;

                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-black">
                          {item.name}
                        </span>

                        <p className="text-sm text-gray-600">
                          {formatNumber(
                            item.count
                          )}{" "}
                          products ·{" "}
                          {formatPercentage(
                            item.percentage
                          )}
                        </p>
                      </div>

                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Brand Analytics"
            subtitle="Inventory performance by brand"
          >
            {brandData.length === 0 ? (
              <EmptyState text="No brand data available." />
            ) : (
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full min-w-[650px]">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">
                        Brand
                      </th>

                      <th className="p-4 text-left">
                        Products
                      </th>

                      <th className="p-4 text-left">
                        Stock
                      </th>

                      <th className="p-4 text-left">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {brandData.map(
                      (brand) => (
                        <tr
                          key={brand.name}
                          className="border-b last:border-0"
                        >
                          <td className="p-4 font-black">
                            {brand.name}
                          </td>

                          <td className="p-4">
                            {formatNumber(
                              brand.products
                            )}
                          </td>

                          <td className="p-4">
                            {formatNumber(
                              brand.stock
                            )}
                          </td>

                          <td className="p-4 font-bold">
                            {formatCurrency(
                              brand.value
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ==================================================
            COLOR AND SIZE ANALYTICS
        ================================================== */}

        <section className="grid xl:grid-cols-2 gap-8">
          <DashboardPanel
            title="Colour Analytics"
            subtitle="Available colour variants"
          >
            {colorData.length === 0 ? (
              <EmptyState text="No colour data available." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {colorData.map((color) => (
                  <div
                    key={color.name}
                    className="border rounded-2xl p-4 text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full mx-auto border shadow-sm"
                      style={{
                        backgroundColor:
                          color.code,
                      }}
                    />

                    <h3 className="font-black mt-3 truncate">
                      {color.name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {formatNumber(
                        color.count
                      )}{" "}
                      variants
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Size Analytics"
            subtitle="Stock availability by size"
          >
            {sizeData.length === 0 ? (
              <EmptyState text="No size data available." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sizeData.map((size) => (
                  <div
                    key={size.name}
                    className="bg-gray-100 rounded-2xl p-5 text-center"
                  >
                    <h3 className="text-2xl font-black">
                      {size.name}
                    </h3>

                    <p className="text-gray-600 mt-2">
                      {formatNumber(
                        size.stock
                      )}{" "}
                      in stock
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ==================================================
            INVENTORY ALERTS
        ================================================== */}

        <section className="grid xl:grid-cols-2 gap-8">
          <DashboardPanel
            title="Low-Stock Alerts"
            subtitle="Products with five or fewer units"
          >
            {lowStockProducts.length === 0 ? (
              <EmptyState text="No low-stock products." />
            ) : (
              <InventoryAlertTable
                products={lowStockProducts}
                label="Low Stock"
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Out-of-Stock Products"
            subtitle="Products requiring immediate restocking"
          >
            {outOfStockProducts.length ===
            0 ? (
              <EmptyState text="No out-of-stock products." />
            ) : (
              <InventoryAlertTable
                products={outOfStockProducts}
                label="Out of Stock"
              />
            )}
          </DashboardPanel>
        </section>
      </div>
    </Layout>
  );
}

// ======================================================
// COMPONENTS
// ======================================================

function SectionHeading({
  title,
  subtitle,
}) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl md:text-3xl font-black">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  badge,
}) {
  return (
    <div className="bg-white border rounded-[24px] p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <p className="text-gray-500 font-semibold">
          {title}
        </p>

        {badge && (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">
            {badge}
          </span>
        )}
      </div>

      <p className="text-3xl md:text-4xl font-black mt-5 break-words">
        {value}
      </p>

      <p className="text-sm text-gray-500 mt-3 leading-6">
        {subtitle}
      </p>
    </div>
  );
}

function SmallMetricCard({
  title,
  value,
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <p className="text-gray-500 text-sm font-semibold">
        {title}
      </p>

      <p className="text-3xl font-black mt-3">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function RateCard({
  title,
  value,
  description,
}) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value || 0))
  );

  return (
    <div className="bg-white border rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">
            {title}
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            {description}
          </p>
        </div>

        <p className="text-3xl font-black">
          {formatPercentage(safeValue)}
        </p>
      </div>

      <div className="h-4 bg-gray-100 rounded-full overflow-hidden mt-6">
        <div
          className="h-full bg-black rounded-full"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function PaymentCard({
  title,
  value,
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <p className="font-bold text-gray-600">
        {title}
      </p>

      <p className="text-3xl font-black mt-4">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function DashboardPanel({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white border rounded-[28px] p-6 md:p-7 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-black">
          {title}
        </h2>

        {subtitle && (
          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-gray-50 border border-dashed rounded-2xl p-10 text-center">
      <p className="text-gray-500 font-semibold">
        {text}
      </p>
    </div>
  );
}

function InventoryAlertTable({
  products,
  label,
}) {
  return (
    <div className="overflow-x-auto max-h-[430px]">
      <table className="w-full min-w-[550px]">
        <thead className="sticky top-0 bg-red-50">
          <tr>
            <th className="p-4 text-left">
              Product
            </th>

            <th className="p-4 text-left">
              Brand
            </th>

            <th className="p-4 text-left">
              Stock
            </th>

            <th className="p-4 text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product._id}
              className="border-b last:border-0"
            >
              <td className="p-4 font-bold">
                {product.name}
              </td>

              <td className="p-4">
                {product.brand ||
                  "No Brand"}
              </td>

              <td className="p-4 text-red-600 font-black">
                {formatNumber(
                  product.totalStock
                )}
              </td>

              <td className="p-4">
                <span className="inline-flex bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-full text-xs font-black uppercase">
                  {label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}