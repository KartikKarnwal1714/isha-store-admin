import { useEffect, useState } from "react";
import adminApi from "../api/client";
import Layout from "../components/Layout";
import { FaPlus, FaTrash } from "react-icons/fa";
import { categories } from "../constants/categories";
import ColorStockBadge from "../components/ColorStockBadge";

const cosmeticCategories = [
  "Mens-Cosmetics",
  "Womens-Cosmetics",
  "Kids-Cosmetics",
];

const kidsAgeOptions = [
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
  "8-9 Years",
  "9-10 Years",
  "10-12 Years",
  "12-14 Years",
];

export default function AddProduct() {
  const [loading, setLoading] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "Men",
    subCategory: "",
    price: "",
    originalPrice: "",
    description: "",
    featured: false,
    colors: [
      {
        colorName: "",
        colorCode: "#000000",
        lowStockThreshold: 5,
        images: [],
        imageUrls: [""],
        sizes: [
          {
            size: "",
            stock: "",
            price: "",
            originalPrice: "",
          },
        ],
      },
    ],
  });

  const fetchSubcategories = async (category) => {
    try {
      if (!category) {
        setAvailableSubcategories([]);
        return;
      }

      const response = await adminApi.get("/subcategories", {
        params: {
          category,
        },
      });

      setAvailableSubcategories(
        response.data.subcategories || []
      );
    } catch (error) {
      console.error(
        "Failed to load subcategories:",
        error
      );

      setAvailableSubcategories([]);
    }
  };

  useEffect(() => {
    fetchSubcategories(product.category);
  }, [product.category]);

  const isCosmetic = cosmeticCategories.includes(product.category);
  const isKids = product.category === "Kids";
  const isJewellery = product.category === "Jewellery";

  const handleCategoryChange = (value) => {
    setProduct({
      ...product,
      category: value,
      subCategory: "",
      price: "",
      originalPrice: "",
      colors: [
        {
          colorName: "",
          colorCode: "#000000",
          lowStockThreshold: 5,
          images: [],
          imageUrls: [""],
          sizes: [
            {
              size: "",
              stock: "",
              price: "",
              originalPrice: "",
            },
          ],
        },
      ],
    });
  };

  const addColor = () => {
    setProduct({
      ...product,
      colors: [
        ...product.colors,
        {
          colorName: "",
          colorCode: "#000000",
          lowStockThreshold: 5,
          images: [],
          imageUrls: [""],
          sizes: [
            {
              size: "",
              stock: "",
              price: "",
              originalPrice: "",
            },
          ],
        },
      ],
    });
  };

  const deleteColor = (colorIndex) => {
    const updatedColors = [...product.colors];
    updatedColors.splice(colorIndex, 1);
    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const addSize = (colorIndex) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].sizes.push({
      size: "",
      stock: "",
      price: "",
      originalPrice: "",
    });

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const deleteSize = (colorIndex, sizeIndex) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].sizes.splice(
      sizeIndex,
      1
    );

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const handleColorChange = (
    colorIndex,
    field,
    value
  ) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex][field] = value;

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const handleSizeChange = (
    colorIndex,
    sizeIndex,
    field,
    value
  ) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].sizes[sizeIndex][field] =
      value;

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const handleImageUpload = (
    colorIndex,
    files
  ) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].images =
      Array.from(files);

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const addImageUrl = (colorIndex) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].imageUrls.push("");

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const handleImageUrlChange = (
    colorIndex,
    urlIndex,
    value
  ) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].imageUrls[urlIndex] =
      value;

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const deleteImageUrl = (
    colorIndex,
    urlIndex
  ) => {
    const updatedColors = [...product.colors];

    updatedColors[colorIndex].imageUrls.splice(
      urlIndex,
      1
    );

    setProduct({
      ...product,
      colors: updatedColors,
    });
  };

  const totalStock = product.colors.reduce(
    (total, color) => {
      return (
        total +
        color.sizes.reduce((sum, size) => {
          return sum + Number(size.stock || 0);
        }, 0)
      );
    },
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasMissingPrice = product.colors.some((color) =>
      color.sizes.some((size) =>
        Number(size.price || 0) <= 0 &&
        Number(size.originalPrice || 0) <= 0
      )
    );

    if (hasMissingPrice) {
      alert("Enter either Selling Price or Original Price for every size. You can enter both too.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("category", product.category);
      formData.append(
        "subCategory",
        product.subCategory
      );
      formData.append(
        "description",
        product.description
      );
      formData.append(
        "featured",
        product.featured
      );
      formData.append(
        "totalStock",
        totalStock
      );

      const firstSize =
        product.colors?.[0]?.sizes?.[0];

      formData.append(
        "price",
        Number(firstSize?.price || firstSize?.originalPrice || 0)
      );

      formData.append(
        "originalPrice",
        Number(firstSize?.originalPrice || 0)
      );

      const colorsWithoutFiles =
        product.colors.map((color) => ({
          colorName: color.colorName,
          colorCode: color.colorCode,
          lowStockThreshold: Number(
            color.lowStockThreshold === "" ||
              color.lowStockThreshold === undefined
              ? 5
              : color.lowStockThreshold
          ),
          imageCount: color.images.length,

          imageUrls: color.imageUrls.filter(
            (url) => url && url.length > 0
          ),

          sizes: color.sizes.map((size) => ({
            size: isJewellery
              ? "Default"
              : size.size,
            stock: Number(size.stock || 0),
            price: Number(
              size.price || size.originalPrice || 0
            ),
            originalPrice: Number(
              size.originalPrice || 0
            ),
          })),

          images: [],
        }));

      formData.append(
        "colors",
        JSON.stringify(colorsWithoutFiles)
      );

      product.colors.forEach((color) => {
        color.images.forEach((image) => {
          formData.append("images", image);
        });
      });

      await adminApi.post(
        "/products",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert("Product Added Successfully");

      setProduct({
        name: "",
        brand: "",
        category: "Men",
        subCategory: "",
        price: "",
        originalPrice: "",
        description: "",
        featured: false,
        colors: [
          {
            colorName: "",
            colorCode: "#000000",
            lowStockThreshold: 5,
            images: [],
            imageUrls: [""],
            sizes: [
              {
                size: "",
                stock: "",
                price: "",
                originalPrice: "",
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Add Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">
              Product Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Product Name"
                className="border p-4 rounded-xl"
                value={product.name}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Brand"
                className="border p-4 rounded-xl"
                value={product.brand}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    brand: e.target.value,
                  })
                }
              />

              <select
                className="border p-4 rounded-xl"
                value={product.category}
                onChange={(e) =>
                  handleCategoryChange(
                    e.target.value
                  )
                }
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="border p-4 rounded-xl"
                value={product.subCategory}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    subCategory:
                      e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select Sub Category
                </option>

                {availableSubcategories.map(
                  (subcategory) => (
                    <option
                      key={subcategory._id}
                      value={subcategory.name}
                    >
                      {subcategory.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <textarea
              placeholder="Description"
              className="border p-4 rounded-xl w-full mt-5"
              rows="5"
              value={product.description}
              onChange={(e) =>
                setProduct({
                  ...product,
                  description:
                    e.target.value,
                })
              }
            />
          </div>

          {product.colors.map(
            (color, colorIndex) => (
              <div
                key={colorIndex}
                className="bg-white p-6 rounded-2xl shadow"
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      Color Variant{" "}
                      {colorIndex + 1}
                    </h2>

                    <ColorStockBadge color={color} />
                  </div>

                  {product.colors.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteColor(
                          colorIndex
                        )
                      }
                      className="bg-red-500 text-white p-3 rounded-xl"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <input
                    type="text"
                    placeholder="Color Name"
                    className="border p-4 rounded-xl"
                    value={color.colorName}
                    onChange={(e) =>
                      handleColorChange(
                        colorIndex,
                        "colorName",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="color"
                    className="h-14 w-full rounded-xl"
                    value={color.colorCode}
                    onChange={(e) =>
                      handleColorChange(
                        colorIndex,
                        "colorCode",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="mb-5">
                  <label className="font-semibold block mb-2">
                    Low-stock alert for this colour
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      className="border p-4 rounded-xl w-40"
                      value={color.lowStockThreshold}
                      onChange={(e) =>
                        handleColorChange(
                          colorIndex,
                          "lowStockThreshold",
                          e.target.value
                        )
                      }
                    />

                    <p className="text-sm text-gray-500">
                      Colour shows as Low Stock when its total
                      stock (all sizes) is this number or less.
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="font-semibold mb-2">
                    Choose Image File
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(
                        colorIndex,
                        e.target.files
                      )
                    }
                  />
                </div>

                <div className="space-y-3 mb-5">
                  <p className="font-semibold">
                    Or Enter Image URL / Base64
                  </p>

                  {color.imageUrls.map(
                    (url, urlIndex) => (
                      <div
                        key={urlIndex}
                        className="flex gap-3"
                      >
                        <input
                          type="text"
                          placeholder="Enter Image URL, Base64, Cloudinary, Google Drive URL"
                          className="border p-4 rounded-xl w-full"
                          value={url}
                          onChange={(e) =>
                            handleImageUrlChange(
                              colorIndex,
                              urlIndex,
                              e.target.value
                            )
                          }
                        />

                        {color.imageUrls
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteImageUrl(
                                colorIndex,
                                urlIndex
                              )
                            }
                            className="bg-red-500 text-white px-4 rounded-xl"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      addImageUrl(
                        colorIndex
                      )
                    }
                    className="bg-blue-500 text-white px-5 py-3 rounded-xl"
                  >
                    Add Image URL
                  </button>
                </div>

                <div className="flex gap-3 flex-wrap mb-6">
                  {color.images.map(
                    (image, index) => (
                      <img
                        key={`file-${index}`}
                        src={URL.createObjectURL(
                          image
                        )}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    )
                  )}

                  {color.imageUrls
                    .filter(
                      (url) =>
                        url &&
                        url.length > 0
                    )
                    .map(
                      (url, index) => (
                        <img
                          key={`url-${index}`}
                          src={url}
                          alt=""
                          className="w-24 h-24 object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )
                    )}
                </div>

                {color.sizes.map(
                  (size, sizeIndex) => (
                    <div
                      key={sizeIndex}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4"
                    >
                      {isCosmetic ? (
                        <input
                          type="text"
                          placeholder="Amount / Weight, like 50gm, 100ml"
                          className="border p-4 rounded-xl"
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(
                              colorIndex,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                          required
                        />
                      ) : isKids ? (
                        <select
                          className="border p-4 rounded-xl"
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(
                              colorIndex,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select Age
                          </option>

                          {kidsAgeOptions.map(
                            (age) => (
                              <option
                                key={age}
                                value={age}
                              >
                                {age}
                              </option>
                            )
                          )}
                        </select>
                      ) : isJewellery ? (
                        <input
                          type="text"
                          className="border p-4 rounded-xl bg-gray-100"
                          value="Default"
                          readOnly
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={
                        product.category === "New Born"
                          ? "Size, like 0-3 Months, 3-6 Months"
                          : "Size, like S, M, L, XL"
                      }
                          className="border p-4 rounded-xl"
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(
                              colorIndex,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                          required
                        />
                      )}

                      <input
                        type="number"
                        placeholder="Selling Price (optional)"
                        aria-label="Selling Price"
                        min="0"
                        step="0.01"
                        className="border p-4 rounded-xl"
                        value={size.price}
                        onChange={(e) =>
                          handleSizeChange(
                            colorIndex,
                            sizeIndex,
                            "price",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="Original Price (optional)"
                        className="border p-4 rounded-xl"
                        min="0"
                        step="0.01"
                        value={
                          size.originalPrice ||
                          ""
                        }
                        onChange={(e) =>
                          handleSizeChange(
                            colorIndex,
                            sizeIndex,
                            "originalPrice",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="Stock"
                        className="border p-4 rounded-xl"
                        value={size.stock}
                        onChange={(e) =>
                          handleSizeChange(
                            colorIndex,
                            sizeIndex,
                            "stock",
                            e.target.value
                          )
                        }
                        required
                      />

                      {color.sizes.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteSize(
                              colorIndex,
                              sizeIndex
                            )
                          }
                          className="bg-red-500 text-white rounded-xl py-3"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )
                )}

                {!isJewellery && (
                  <button
                    type="button"
                    onClick={() =>
                      addSize(colorIndex)
                    }
                    className="bg-blue-500 text-white px-5 py-3 rounded-xl"
                  >
                    {isCosmetic
                      ? "Add Amount Variant"
                      : isKids
                      ? "Add Age Variant"
                      : "Add Size"}
                  </button>
                )}
              </div>
            )
          )}

          <button
            type="button"
            onClick={addColor}
            className="bg-black text-white px-6 py-4 rounded-2xl flex items-center gap-3"
          >
            <FaPlus />
            Add Color Variant
          </button>

          <div className="bg-yellow-100 p-5 rounded-2xl text-2xl font-bold">
            Total Stock: {totalStock}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-10 py-5 rounded-2xl text-xl font-bold"
          >
            {loading
              ? "Uploading..."
              : "Create Product"}
          </button>
        </form>
      </div>
    </Layout>
  );
}