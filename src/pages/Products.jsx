import {
  useEffect,
  useState,
} from "react";

import adminApi from "../api/client";

import { Link } from "react-router-dom";

import Layout from "../components/Layout";

import VariantEditor from "../components/VariantEditor";

export default function Products() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

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

  // =========================
  // OPEN VARIANT EDITOR
  // =========================

  const openVariantEditor = (
    product
  ) => {

    // deep copy to avoid direct mutation

    const cloned =
      JSON.parse(
        JSON.stringify(product)
      );

    setSelectedProduct(cloned);

    setIsOpen(true);
  };

  // =========================
  // CLOSE VARIANT EDITOR
  // =========================

  const closeVariantEditor =
    () => {

      setIsOpen(false);

      setSelectedProduct(null);
    };

  // =========================
  // SAVE PRODUCT
  // =========================

  const saveProduct =
    async (updatedProduct) => {

      try {

        await adminApi.put(
          `/products/${updatedProduct._id}`,
          updatedProduct
        );

        await fetchProducts();

      } catch (error) {

        console.log(error);

        alert(
          "Update Failed"
        );
      }
    };

  // =========================
  // UPDATE STOCK
  // =========================

  const updateVariantStock =
    async (
      productId,
      colorIndex,
      sizeIndex,
      stock
    ) => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors[
          colorIndex
        ].sizes[
          sizeIndex
        ].stock =
          Number(stock);

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // DELETE IMAGE
  // =========================

  const deleteImage =
    async (
      productId,
      colorIndex,
      imageIndex
    ) => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors[
          colorIndex
        ].images.splice(
          imageIndex,
          1
        );

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // ADD COLOR
  // =========================

  const addColor =
    async () => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors.push({

          colorName:
            "New Color",

          colorCode:
            "#000000",

          images: [],

          sizes: [
            {
              size: "M",
              stock: 0,
            },
          ],
        });

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // DELETE COLOR
  // =========================

  const deleteColor =
    async (
      productId,
      colorIndex
    ) => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors.splice(
          colorIndex,
          1
        );

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // ADD SIZE
  // =========================

  const addSize =
    async (
      productId,
      colorIndex
    ) => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors[
          colorIndex
        ].sizes.push({

          size: "M",

          stock: 0,
        });

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // DELETE SIZE
  // =========================

  const deleteSize =
    async (
      productId,
      colorIndex,
      sizeIndex
    ) => {

      try {

        const updatedProduct =
          {
            ...selectedProduct,
          };

        updatedProduct.colors[
          colorIndex
        ].sizes.splice(
          sizeIndex,
          1
        );

        setSelectedProduct(
          updatedProduct
        );

        await saveProduct(
          updatedProduct
        );

      } catch (error) {

        console.log(error);

      }
    };

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

            product.colors?.forEach(
              (color) => {

                totalVariants++;

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
                        totalStock <= 5
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-600"
                      }`}
                    >

                      {totalStock <= 5
                        ? "LOW STOCK"
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

                  {/* COLORS */}

                  <div className="flex flex-wrap gap-3 mt-5">

                    {product.colors?.map(
                      (
                        color,
                        index
                      ) => (

                        <div
                          key={index}
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                          title={
                            color.colorName
                          }
                          style={{
                            background:
                              color.colorCode,
                          }}
                        />
                      )
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

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">

                    <Link
                      to={`/edit/${product._id}`}
                      className="bg-emerald-600 text-white py-3 rounded-2xl font-bold text-center text-sm sm:text-base flex items-center justify-center"
                    >

                      Edit

                    </Link>

                    <button
                      onClick={() =>
                        openVariantEditor(
                          product
                        )
                      }
                      className="bg-blue-500 text-white py-3 rounded-2xl font-bold text-sm sm:text-base px-1"
                    >

                      Variant Editor

                    </button>

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

      {/* VARIANT EDITOR */}

      <VariantEditor
        isOpen={isOpen}
        onClose={
          closeVariantEditor
        }
        product={selectedProduct}
        updateVariantStock={
          updateVariantStock
        }
        deleteImage={
          deleteImage
        }
        addColor={addColor}
        deleteColor={
          deleteColor
        }
        addSize={addSize}
        deleteSize={deleteSize}
      />

    </Layout>
  );
}