import { useEffect, useState } from "react";
import adminApi from "../api/client";
import Layout from "../components/Layout";

export default function AddCoupon() {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const [coupon, setCoupon] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleChange = (field, value) => {
    setCoupon({
      ...coupon,
      [field]: value,
    });
  };

  const fetchCoupons = async () => {
    try {
      const res = await adminApi.get(
        "/coupons"
      );

      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coupon.code.trim()) {
      alert("Enter coupon code");
      return;
    }

    if (!coupon.discountValue) {
      alert("Enter discount value");
      return;
    }

    if (coupon.startDate && coupon.endDate) {
      if (new Date(coupon.startDate) > new Date(coupon.endDate)) {
        alert("Start date cannot be after end date");
        return;
      }
    }

    try {
      setLoading(true);

      await adminApi.post("/coupons", {
        code: coupon.code.trim().toUpperCase(),
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: Number(coupon.minOrderAmount || 0),
        startDate: coupon.startDate || null,
        endDate: coupon.endDate || null,
        isActive: coupon.isActive,
      });

      alert("Coupon Created Successfully");

      setCoupon({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });

      fetchCoupons();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Coupon creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Add Coupon
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <input
              type="text"
              placeholder="Coupon Code e.g. SAVE10"
              value={coupon.code}
              onChange={(e) =>
                handleChange(
                  "code",
                  e.target.value.toUpperCase()
                )
              }
              className="border p-4 rounded-xl"
            />

            <select
              value={coupon.discountType}
              onChange={(e) =>
                handleChange("discountType", e.target.value)
              }
              className="border p-4 rounded-xl"
            >
              <option value="percent">
                Percentage Discount
              </option>

              <option value="flat">
                Flat Discount
              </option>
            </select>

            <input
              type="number"
              placeholder={
                coupon.discountType === "percent"
                  ? "Discount % e.g. 10"
                  : "Flat Amount e.g. 500"
              }
              value={coupon.discountValue}
              onChange={(e) =>
                handleChange(
                  "discountValue",
                  e.target.value
                )
              }
              className="border p-4 rounded-xl"
            />

            <input
              type="number"
              placeholder="Minimum Order Amount"
              value={coupon.minOrderAmount}
              onChange={(e) =>
                handleChange(
                  "minOrderAmount",
                  e.target.value
                )
              }
              className="border p-4 rounded-xl"
            />

            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date
              </label>

              <input
                type="date"
                value={coupon.startDate}
                onChange={(e) =>
                  handleChange("startDate", e.target.value)
                }
                className="border p-4 rounded-xl w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date
              </label>

              <input
                type="date"
                value={coupon.endDate}
                onChange={(e) =>
                  handleChange("endDate", e.target.value)
                }
                className="border p-4 rounded-xl w-full"
              />
            </div>

            <select
              value={coupon.isActive ? "active" : "inactive"}
              onChange={(e) =>
                handleChange(
                  "isActive",
                  e.target.value === "active"
                )
              }
              className="border p-4 rounded-xl"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-10 py-4 rounded-2xl text-lg font-bold disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow mt-10">
          <h2 className="text-3xl font-bold mb-6">
            All Coupons
          </h2>

          {coupons.length === 0 ? (
            <p className="text-gray-500">
              No coupons created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-4 border">
                      Code
                    </th>

                    <th className="p-4 border">
                      Type
                    </th>

                    <th className="p-4 border">
                      Value
                    </th>

                    <th className="p-4 border">
                      Min Order
                    </th>

                    <th className="p-4 border">
                      Start Date
                    </th>

                    <th className="p-4 border">
                      End Date
                    </th>

                    <th className="p-4 border">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((item) => (
                    <tr key={item._id}>
                      <td className="p-4 border font-bold">
                        {item.code}
                      </td>

                      <td className="p-4 border">
                        {item.discountType}
                      </td>

                      <td className="p-4 border">
                        {item.discountType === "percent"
                          ? `${item.discountValue}%`
                          : `₹${item.discountValue}`}
                      </td>

                      <td className="p-4 border">
                        ₹{item.minOrderAmount}
                      </td>

                      <td className="p-4 border">
                        {item.startDate
                          ? new Date(
                              item.startDate
                            ).toLocaleDateString()
                          : "Not set"}
                      </td>

                      <td className="p-4 border">
                        {item.endDate
                          ? new Date(
                              item.endDate
                            ).toLocaleDateString()
                          : "Not set"}
                      </td>

                      <td className="p-4 border">
                        {item.isActive ? (
                          <span className="text-green-600 font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}