
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const emptySize = () => ({
  size: "",
  stock: "",
  price: "",
  originalPrice: "",
  sku: "",
  barcode: "",
});

const emptyColor = () => ({
  colorName: "",
  colorCode: "#000000",
  lowStockThreshold: 5,
  existingImages: [],
  images: [],
  imageUrls: [""],
  sizes: [emptySize()],
});

const sizeKind = (category) => {
  if (cosmeticCategories.includes(category)) return "cosmetic";
  if (category === "Kids") return "kids";
  if (category === "Jewellery") return "jewellery";
  if (category === "New Born") return "newborn";
  return "clothing";
};

function FilePreview({ file, onRemove }) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(src);
  }, [src]);

  return (
    <div className="relative">
      <img
        src={src}
        alt={file.name}
        className="h-24 w-24 rounded-xl object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white"
        title="Remove image"
      >
        <FaTrash size={10} />
      </button>
    </div>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] =
    useState([]);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "Men",
    subCategory: "",
    description: "",
    featured: false,
    colors: [emptyColor()],
  });

  const fetchProduct = async () => {
    try {
      setFetching(true);
      setNotFound(false);

      const res = await adminApi.get(`/products/${id}`);
      const p = res.data.product;

      if (!p) {
        setNotFound(true);
        return;
      }

      const colors =
        Array.isArray(p.colors) && p.colors.length > 0
          ? p.colors.map((color) => ({
              colorName: color.colorName || "",
              colorCode: color.colorCode || "#000000",
              lowStockThreshold: color.lowStockThreshold ?? 5,
              existingImages: Array.isArray(color.images)
                ? color.images.filter(Boolean)
                : [],
              images: [],
              imageUrls: [""],
              sizes:
                Array.isArray(color.sizes) &&
                color.sizes.length > 0
                  ? color.sizes.map((size) => ({
                      size: size.size ?? "",
                      stock: size.stock ?? "",
                      price: size.price ?? "",
                      originalPrice: size.originalPrice ?? "",
                      sku: size.sku || "",
                      barcode: size.barcode || "",
                    }))
                  : [emptySize()],
            }))
          : [emptyColor()];

      setProduct({
        name: p.name || "",
        brand: p.brand || "",
        category: p.category || "Men",
        subCategory: p.subCategory || "",
        description: p.description || "",
        featured: Boolean(p.featured),
        colors,
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  };

  const fetchSubcategories = async (category) => {
    try {
      if (!category) {
        setAvailableSubcategories([]);
        return;
      }

      const response = await adminApi.get("/subcategories", {
        params: { category },
      });

      setAvailableSubcategories(
        response.data.subcategories || []
      );
    } catch (error) {
      console.error("Failed to load subcategories:", error);
      setAvailableSubcategories([]);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchSubcategories(product.category);
  }, [product.category]);

  const isCosmetic = cosmeticCategories.includes(product.category);
  const isKids = product.category === "Kids";
  const isJewellery = product.category === "Jewellery";

  const updateColor = (colorIndex, updater) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex ? updater(color) : color
      ),
    }));
  };

  const handleCategoryChange = (value) => {
    setProduct((prev) => {
      const kindChanged =
        sizeKind(prev.category) !== sizeKind(value);

      return {
        ...prev,
        category: value,
        subCategory: "",
        colors: kindChanged
          ? prev.colors.map((color) => ({
              ...color,
              sizes: color.sizes.map((size) => ({
                ...size,
                size: value === "Jewellery" ? "Default" : "",
              })),
            }))
          : prev.colors,
      };
    });
  };

  const addColor = () => {
    setProduct((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          ...emptyColor(),
          sizes: [
            {
              ...emptySize(),
              size: prev.category === "Jewellery" ? "Default" : "",
            },
          ],
        },
      ],
    }));
  };

  const deleteColor = (colorIndex) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter(
        (_, index) => index !== colorIndex
      ),
    }));
  };

  const handleColorChange = (colorIndex, field, value) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      [field]: value,
    }));
  };

  const addSize = (colorIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      sizes: [...color.sizes, emptySize()],
    }));
  };

  const deleteSize = (colorIndex, sizeIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      sizes: color.sizes.filter(
        (_, index) => index !== sizeIndex
      ),
    }));
  };

  const handleSizeChange = (
    colorIndex,
    sizeIndex,
    field,
    value
  ) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      sizes: color.sizes.map((size, index) =>
        index === sizeIndex
          ? { ...size, [field]: value }
          : size
      ),
    }));
  };

  const removeExistingImage = (colorIndex, imageIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      existingImages: color.existingImages.filter(
        (_, index) => index !== imageIndex
      ),
    }));
  };

  const handleImageUpload = (colorIndex, files) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      images: [...color.images, ...Array.from(files || [])],
    }));
  };

  const removeNewImage = (colorIndex, imageIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      images: color.images.filter(
        (_, index) => index !== imageIndex
      ),
    }));
  };

  const addImageUrl = (colorIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: [...color.imageUrls, ""],
    }));
  };

  const handleImageUrlChange = (
    colorIndex,
    urlIndex,
    value
  ) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: color.imageUrls.map((url, index) =>
        index === urlIndex ? value : url
      ),
    }));
  };

  const deleteImageUrl = (colorIndex, urlIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: color.imageUrls.filter(
        (_, index) => index !== urlIndex
      ),
    }));
  };

  const totalStock = product.colors.reduce(
    (total, color) =>
      total +
      color.sizes.reduce(
        (sum, size) => sum + Number(size.stock || 0),
        0
      ),
    0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!product.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (product.colors.length === 0) {
      alert("At least one colour variant is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("description", product.description);
      formData.append("featured", product.featured);
      formData.append("totalStock", totalStock);

      const firstSize = product.colors?.[0]?.sizes?.[0];

      formData.append("price", Number(firstSize?.price || 0));
      formData.append(
        "originalPrice",
        Number(firstSize?.originalPrice || 0)
      );

      const colorsWithoutFiles = product.colors.map((color) => ({
        colorName: color.colorName,
        colorCode: color.colorCode,
        lowStockThreshold: Number(
          color.lowStockThreshold === "" ||
            color.lowStockThreshold === undefined
            ? 5
            : color.lowStockThreshold
        ),
        imageCount: color.images.length,
        existingImages: color.existingImages,
        imageUrls: color.imageUrls.filter(
          (url) => url && url.length > 0
        ),
        sizes: color.sizes.map((size) => ({
          size: isJewellery ? "Default" : size.size,
          stock: Number(size.stock || 0),
          price: Number(size.price || 0),
          originalPrice: Number(size.originalPrice || 0),
          sku: size.sku || "",
          barcode: size.barcode || "",
        })),
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

      await adminApi.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product updated successfully");
      navigate("/products");
    } catch (error) {
      console.error("Product update failed:", error);

      alert(
        error.response?.data?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl p-10 text-xl font-semibold">
          Loading product...
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl p-10">
          <p className="mb-5 text-xl font-semibold">
            Product not found.
          </p>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-xl bg-black px-6 py-3 text-white"
          >
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Edit Product</h1>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="font-semibold text-gray-600"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PRODUCT INFO */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-bold">
              Product Info
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input
                type="text"
                placeholder="Product Name"
                className="rounded-xl border p-4"
                value={product.name}
                onChange={(event) =>
                  setProduct({
                    ...product,
                    name: event.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Brand"
                className="rounded-xl border p-4"
                value={product.brand}
                onChange={(event) =>
                  setProduct({
                    ...product,
                    brand: event.target.value,
                  })
                }
              />

              <select
                className="rounded-xl border p-4"
                value={product.category}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border p-4"
                value={product.subCategory}
                onChange={(event) =>
                  setProduct({
                    ...product,
                    subCategory: event.target.value,
                  })
                }
                required
              >
                <option value="">Select Sub Category</option>
                {availableSubcategories.map((subcategory) => (
                  <option
                    key={subcategory._id}
                    value={subcategory.name}
                  >
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Description"
              className="mt-5 w-full rounded-xl border p-4"
              rows={5}
              value={product.description}
              onChange={(event) =>
                setProduct({
                  ...product,
                  description: event.target.value,
                })
              }
            />

            <label className="mt-5 flex items-center gap-3 font-semibold">
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(event) =>
                  setProduct({
                    ...product,
                    featured: event.target.checked,
                  })
                }
              />
              Featured Product
            </label>
          </div>

          {/* COLOR VARIANTS */}
          {product.colors.map((color, colorIndex) => (
            <div
              key={colorIndex}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    Color Variant {colorIndex + 1}
                  </h2>
                  <ColorStockBadge color={color} />
                </div>

                {product.colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteColor(colorIndex)}
                    className="rounded-xl bg-red-500 p-3 text-white"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Color Name"
                  className="rounded-xl border p-4"
                  value={color.colorName}
                  onChange={(event) =>
                    handleColorChange(
                      colorIndex,
                      "colorName",
                      event.target.value
                    )
                  }
                />

                <input
                  type="color"
                  className="h-14 w-full rounded-xl"
                  value={color.colorCode}
                  onChange={(event) =>
                    handleColorChange(
                      colorIndex,
                      "colorCode",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="mb-5">
                <label className="mb-2 block font-semibold">
                  Low-stock alert for this colour
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    className="w-40 rounded-xl border p-4"
                    value={color.lowStockThreshold}
                    onChange={(event) =>
                      handleColorChange(
                        colorIndex,
                        "lowStockThreshold",
                        event.target.value
                      )
                    }
                  />

                  <p className="text-sm text-gray-500">
                    Colour shows as Low Stock when its total
                    stock across all sizes is this number or less.
                  </p>
                </div>
              </div>

              {/* CURRENT IMAGES */}
              {color.existingImages.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 font-semibold">
                    Current Images
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {color.existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-24 w-24 rounded-xl object-cover"
                          onError={(event) => {
                            event.currentTarget.style.opacity = "0.3";
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(colorIndex, index)
                          }
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white"
                          title="Remove image"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPLOAD FILES */}
              <div className="mb-5">
                <p className="mb-2 font-semibold">
                  Choose Image File
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => {
                    handleImageUpload(
                      colorIndex,
                      event.target.files
                    );
                    event.target.value = "";
                  }}
                />
              </div>

              {color.images.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-3">
                  {color.images.map((image, index) => (
                    <FilePreview
                      key={`file-${index}-${image.name}`}
                      file={image}
                      onRemove={() =>
                        removeNewImage(colorIndex, index)
                      }
                    />
                  ))}
                </div>
              )}

              {/* IMAGE URLS */}
              <div className="mb-5 space-y-3">
                <p className="font-semibold">
                  Or Enter Image URL / Base64
                </p>

                {color.imageUrls.map((url, urlIndex) => (
                  <div
                    key={urlIndex}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Enter image URL or Base64"
                      className="w-full rounded-xl border p-4"
                      value={url}
                      onChange={(event) =>
                        handleImageUrlChange(
                          colorIndex,
                          urlIndex,
                          event.target.value
                        )
                      }
                    />

                    {color.imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteImageUrl(colorIndex, urlIndex)
                        }
                        className="rounded-xl bg-red-500 px-4 text-white"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addImageUrl(colorIndex)}
                  className="rounded-xl bg-blue-500 px-5 py-3 text-white"
                >
                  Add Image URL
                </button>
              </div>

              {color.imageUrls.some(
                (url) => url && url.length > 0
              ) && (
                <div className="mb-6 flex flex-wrap gap-3">
                  {color.imageUrls
                    .filter((url) => url && url.length > 0)
                    .map((url, index) => (
                      <img
                        key={`url-${index}`}
                        src={url}
                        alt=""
                        className="h-24 w-24 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                </div>
              )}

              {/* SIZES */}
              {color.sizes.map((size, sizeIndex) => (
                <div
                  key={sizeIndex}
                  className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5"
                >
                  {isCosmetic ? (
                    <input
                      type="text"
                      placeholder="Amount / Weight, e.g. 50gm, 100ml"
                      className="rounded-xl border p-4"
                      value={size.size}
                      onChange={(event) =>
                        handleSizeChange(
                          colorIndex,
                          sizeIndex,
                          "size",
                          event.target.value
                        )
                      }
                      required
                    />
                  ) : isKids ? (
                    <select
                      className="rounded-xl border p-4"
                      value={size.size}
                      onChange={(event) =>
                        handleSizeChange(
                          colorIndex,
                          sizeIndex,
                          "size",
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">Select Age</option>

                      {size.size &&
                        !kidsAgeOptions.includes(size.size) && (
                          <option value={size.size}>
                            {size.size}
                          </option>
                        )}

                      {kidsAgeOptions.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  ) : isJewellery ? (
                    <input
                      type="text"
                      className="rounded-xl border bg-gray-100 p-4"
                      value="Default"
                      readOnly
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={
                        product.category === "New Born"
                          ? "Size, e.g. 0-3 Months, 3-6 Months"
                          : "Size, e.g. S, M, L, XL"
                      }
                      className="rounded-xl border p-4"
                      value={size.size}
                      onChange={(event) =>
                        handleSizeChange(
                          colorIndex,
                          sizeIndex,
                          "size",
                          event.target.value
                        )
                      }
                      required
                    />
                  )}

                  <input
                    type="number"
                    placeholder="Price"
                    className="rounded-xl border p-4"
                    value={size.price}
                    onChange={(event) =>
                      handleSizeChange(
                        colorIndex,
                        sizeIndex,
                        "price",
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="number"
                    placeholder="Original Price"
                    className="rounded-xl border p-4"
                    value={size.originalPrice || ""}
                    onChange={(event) =>
                      handleSizeChange(
                        colorIndex,
                        sizeIndex,
                        "originalPrice",
                        event.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    placeholder="Stock"
                    className="rounded-xl border p-4"
                    value={size.stock}
                    onChange={(event) =>
                      handleSizeChange(
                        colorIndex,
                        sizeIndex,
                        "stock",
                        event.target.value
                      )
                    }
                    required
                  />

                  {color.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteSize(colorIndex, sizeIndex)
                      }
                      className="rounded-xl bg-red-500 py-3 text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}

              {!isJewellery && (
                <button
                  type="button"
                  onClick={() => addSize(colorIndex)}
                  className="rounded-xl bg-blue-500 px-5 py-3 text-white"
                >
                  {isCosmetic
                    ? "Add Amount Variant"
                    : isKids
                      ? "Add Age Variant"
                      : "Add Size"}
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addColor}
            className="flex items-center gap-3 rounded-2xl bg-black px-6 py-4 text-white"
          >
            <FaPlus />
            Add Color Variant
          </button>

          <div className="rounded-2xl bg-yellow-100 p-5 text-2xl font-bold">
            Total Stock: {totalStock}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-green-600 px-10 py-5 text-xl font-bold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
