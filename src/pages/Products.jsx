import {
  useEffect,
  useState,
} from "react";

import adminApi from "../api/client";

import { Link } from "react-router-dom";

import Layout from "../components/Layout";

import { getColorStockInfo } from "../utils/stockStatus";

export default function Products() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts =
    async () => {

      try {

        const res =
          await adminApi.get(
            "/products?limit=5000"
          );

        setProducts(
          res.data.products || []
        );

      } catch (error) {

        console.log(error);

      }
    };

  useEffect(() => {

    fetchProducts();

  }, []);

  return (
    <Layout>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">

        <div>

          <h1 className="text-3xl sm:text-4xl font-bold">

            Products

          </h1>

          <p className="text-gray-500 mt-2">

            Enterprise Product Management

          </p>

        </div>

        <Link to="/add-product">

          <button className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-2xl">

            Add Product

          </button>

        </Link>

      </div>

      {/* SEARCH */}

      <div className="bg-white p-5 rounded-2xl shadow mb-8">

        <input
          type="text"
          placeholder="Search by product name..."
          className="border p-4 rounded-xl w-full"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* PRODUCTS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {products

          .filter((product) =>
            product.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
          )

          .map((product) => {

            let totalStock = 0;

            let totalVariants = 0;

            let lowColors = 0;

            let outColors = 0;

            product.colors?.forEach(
              (color) => {

                totalVariants++;

                const info =
                  getColorStockInfo(color);

                if (info.status === "low_stock")
                  lowColors++;

                if (info.status === "out_of_stock")
                  outColors++;

                color.sizes?.forEach(
                  (size) => {

                    totalStock +=
                      Number(
                        size.stock
                      );
                  }
                );
              }
            );

            return (

              <div
                key={product._id}
                className="bg-white rounded-3xl shadow overflow-hidden"
              >

                {/* IMAGE */}

                <img
                  src={
                    product.colors?.[0]
                      ?.images?.[0] ||
                    "https://via.placeholder.com/500x500?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-72 object-cover"
                />

                {/* CONTENT */}

                <div className="p-6">

                  {/* CATEGORY */}

                  <div className="flex justify-between items-center mb-3">

                    <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold">

                      {product.category}

                    </span>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        totalStock <= 0
                          ? "bg-red-100 text-red-500"
                          : lowColors > 0 || outColors > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-600"
                      }`}
                    >

                      {totalStock <= 0
                        ? "OUT OF STOCK"
                        : outColors > 0
                        ? `${outColors} COLOUR OUT`
                        : lowColors > 0
                        ? `${lowColors} COLOUR LOW`
                        : "IN STOCK"}

                    </span>

                  </div>

                  {/* NAME */}

                  <h2 className="text-2xl font-bold">

                    {product.name}

                  </h2>

                  {/* BRAND */}

                  <p className="text-gray-500 mt-1">

                    {product.brand}

                  </p>

                  {/* PRICE */}

                  <div className="flex items-center gap-3 mt-4">

                    <p className="text-2xl font-bold">

                      ₹ {product.price}

                    </p>

                    {product.originalPrice >
                      0 && (

                      <p className="line-through text-gray-400">

                        ₹{" "}
                        {
                          product.originalPrice
                        }

                      </p>
                    )}

                  </div>

                  {/* COLORS (colour-wise stock) */}

                  <div className="flex flex-wrap gap-2 mt-5">

                    {product.colors?.map(
                      (
                        color,
                        index
                      ) => {

                        const info =
                          getColorStockInfo(
                            color
                          );

                        return (

                          <div
                            key={index}
                            className={`flex items-center gap-2 border rounded-full pl-1 pr-3 py-1 text-xs font-bold ${info.badge}`}
                            title={`${color.colorName}: ${info.stock} in stock (${info.label})`}
                          >

                            <span
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{
                                background:
                                  color.colorCode,
                              }}
                            />

                            <span>
                              {color.colorName ||
                                "Colour"}
                            </span>

                            <span>
                              {info.status ===
                              "out_of_stock"
                                ? "Out"
                                : info.stock}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-2 gap-4 mt-6">

                    <div className="bg-gray-100 rounded-2xl p-4">

                      <p className="text-sm text-gray-500">

                        Total Stock

                      </p>

                      <h3 className="text-2xl font-bold mt-2">

                        {totalStock}

                      </h3>

                    </div>

                    <div className="bg-gray-100 rounded-2xl p-4">

                      <p className="text-sm text-gray-500">

                        Variants

                      </p>

                      <h3 className="text-2xl font-bold mt-2">

                        {totalVariants}

                      </h3>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-6">

                    <Link
                      to={`/edit/${product._id}`}
                      className="bg-emerald-600 text-white py-3 rounded-2xl font-bold text-center text-sm sm:text-base flex items-center justify-center"
                    >

                      Edit

                    </Link>

                    <button
                      onClick={async () => {

                        const confirmDelete =
                          window.confirm(
                            "Delete this product?"
                          );

                        if (
                          !confirmDelete
                        )
                          return;

                        try {

                          await adminApi.delete(
                            `/products/${product._id}`
                          );

                          fetchProducts();

                        } catch (
                          error
                        ) {

                          console.log(
                            error
                          );
                        }
                      }}
                      className="bg-red-500 text-white rounded-2xl font-bold text-sm sm:text-base"
                    >

                      Delete

                    </button>

                  </div>

                </div>

              </div>
            );
          })}

      </div>

    </Layout>
  );
}