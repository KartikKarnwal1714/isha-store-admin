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
  existingImages: [], // already saved on the server
  images: [], // newly chosen files
  imageUrls: [""], // new URL / base64 images
  sizes: [emptySize()],
});

// Which kind of size field a category uses
const sizeKind = (category) => {
  if (cosmeticCategories.includes(category)) return "cosmetic";
  if (category === "Kids") return "kids";
  if (category === "Jewellery") return "jewellery";
  if (category === "New Born") return "newborn";
  return "clothing";
};

// Preview of a newly chosen file (revokes the object URL on cleanup)
function FilePreview({ file, onRemove }) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(src);
  }, [src]);

  return (
    <div className="relative">
      <img
        src={src}
        alt=""
        className="w-24 h-24 object-cover rounded-xl"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
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

  // ------------------------------------------------------
  // LOAD PRODUCT
  // ------------------------------------------------------

  const fetchProduct = async () => {
    try {
      setFetching(true);

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
        featured: !!p.featured,
        colors,
      });
    } catch (error) {
      console.log(error);
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

  // ------------------------------------------------------
  // HELPERS (immutable updates)
  // ------------------------------------------------------

  const updateColor = (colorIndex, updater) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === colorIndex ? updater(color) : color
      ),
    }));
  };

  const handleCategoryChange = (value) => {
    setProduct((prev) => {
      const kindChanged =
        sizeKind(prev.category) !== sizeKind(value);

      // Colours, stock, prices and images are kept. If the size
      // field type changes (e.g. S/M/L -> age or weight), the old
      // size labels no longer make sense, so they are cleared.
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
      colors: prev.colors.filter((_, i) => i !== colorIndex),
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
      sizes: color.sizes.filter((_, i) => i !== sizeIndex),
    }));
  };

  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      sizes: color.sizes.map((size, i) =>
        i === sizeIndex ? { ...size, [field]: value } : size
      ),
    }));
  };

  // Saved images
  const removeExistingImage = (colorIndex, imageIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      existingImages: color.existingImages.filter(
        (_, i) => i !== imageIndex
      ),
    }));
  };

  // Newly chosen files
  const handleImageUpload = (colorIndex, files) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      images: [...color.images, ...Array.from(files)],
    }));
  };

  const removeNewImage = (colorIndex, imageIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      images: color.images.filter((_, i) => i !== imageIndex),
    }));
  };

  // Image URLs / base64
  const addImageUrl = (colorIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: [...color.imageUrls, ""],
    }));
  };

  const handleImageUrlChange = (colorIndex, urlIndex, value) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: color.imageUrls.map((url, i) =>
        i === urlIndex ? value : url
      ),
    }));
  };

  const deleteImageUrl = (colorIndex, urlIndex) => {
    updateColor(colorIndex, (color) => ({
      ...color,
      imageUrls: color.imageUrls.filter((_, i) => i !== urlIndex),
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

  // ------------------------------------------------------
  // SAVE
  // ------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      formData.append("colors", JSON.stringify(colorsWithoutFiles));

      // Files must be appended in colour order so the server can
      // assign them back using each colour's imageCount.
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
      console.log(error);

      alert(
        error.response?.data?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------

  if (fetching) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-10 text-xl font-semibold">
          Loading product...
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-10">
          <p className="text-xl font-semibold mb-5">
            Product not found.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Edit Product</h1>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-gray-600 font-semibold"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PRODUCT INFO */}
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
                  setProduct({ ...product, name: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Brand"
                className="border p-4 rounded-xl"
                value={product.brand}
                onChange={(e) =>
                  setProduct({ ...product, brand: e.target.value })
                }
              />

              <select
                className="border p-4 rounded-xl"
                value={product.category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value)
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
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
                    subCategory: e.target.value,
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
              className="border p-4 rounded-xl w-full mt-5"
              rows="5"
              value={product.description}
              onChange={(e) =>
                setProduct({
                  ...product,
                  description: e.target.value,
                })
              }
            />

            <label className="flex items-center gap-3 mt-5 font-semibold">
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    featured: e.target.checked,
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
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex justify-between items-center mb-5">
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

              {/* CURRENT (SAVED) IMAGES */}
              {color.existingImages.length > 0 && (
                <div className="mb-5">
                  <p className="font-semibold mb-2">
                    Current Images
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    {color.existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={url}
                          alt=""
                          className="w-24 h-24 object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.opacity = "0.3";
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(colorIndex, index)
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
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
                <p className="font-semibold mb-2">
                  Choose Image File
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(colorIndex, e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {color.images.length > 0 && (
                <div className="flex gap-3 flex-wrap mb-5">
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
              <div className="space-y-3 mb-5">
                <p className="font-semibold">
                  Or Enter Image URL / Base64
                </p>

                {color.imageUrls.map((url, urlIndex) => (
                  <div key={urlIndex} className="flex gap-3">
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

                    {color.imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteImageUrl(colorIndex, urlIndex)
                        }
                        className="bg-red-500 text-white px-4 rounded-xl"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addImageUrl(colorIndex)}
                  className="bg-blue-500 text-white px-5 py-3 rounded-xl"
                >
                  Add Image URL
                </button>
              </div>

              {color.imageUrls.some((url) => url && url.length > 0) && (
                <div className="flex gap-3 flex-wrap mb-6">
                  {color.imageUrls
                    .filter((url) => url && url.length > 0)
                    .map((url, index) => (
                      <img
                        key={`url-${index}`}
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                </div>
              )}

              {/* SIZES */}
              {color.sizes.map((size, sizeIndex) => (
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
                      <option value="">Select Age</option>

                      {/* keep a legacy value selectable if it is not in the list */}
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
                    placeholder="Price"
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
                    required
                  />

                  <input
                    type="number"
                    placeholder="Original Price"
                    className="border p-4 rounded-xl"
                    value={size.originalPrice || ""}
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

                  {color.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteSize(colorIndex, sizeIndex)
                      }
                      className="bg-red-500 text-white rounded-xl py-3"
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
          ))}

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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
