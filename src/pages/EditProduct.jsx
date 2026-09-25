import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../api/client";
import Layout from "../components/Layout";
import { FaTrash } from "react-icons/fa";
import { categories, subCategories } from "../constants/categories";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "Men",
    subCategory: "",
    description: "",
    price: "",
    originalPrice: "",
    featured: false,
  });

  // Existing image URLs already saved on the product
  const [existingImages, setExistingImages] = useState([]);

  // Newly chosen files to upload on save
  const [newImages, setNewImages] = useState([]);

  const fetchProduct = async () => {
    try {
      setFetching(true);

      const res = await adminApi.get(`/products/${id}`);
      const p = res.data.product;

      if (!p) {
        setNotFound(true);
        return;
      }

      setProduct({
        name: p.name || "",
        brand: p.brand || "",
        category: p.category || "Men",
        subCategory: p.subCategory || "",
        description: p.description || "",
        price: p.price ?? "",
        originalPrice: p.originalPrice ?? "",
        featured: !!p.featured,
      });

      setExistingImages(
        Array.isArray(p.colors) && p.colors.length > 0
          ? p.colors[0].images || []
          : []
      );
    } catch (error) {
      console.log(error);
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCategoryChange = (value) => {
    setProduct({
      ...product,
      category: value,
      subCategory: "",
    });
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const handleNewImages = (files) => {
    setNewImages(Array.from(files));
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name.trim()) {
      alert("Product name is required");
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
      formData.append("price", Number(product.price || 0));
      formData.append(
        "originalPrice",
        Number(product.originalPrice || 0)
      );
      formData.append("featured", product.featured);

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      newImages.forEach((image) => {
        formData.append("images", image);
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
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-10 text-xl font-semibold">
          Loading product...
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-10">
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
      <div className="max-w-5xl mx-auto">
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
                onChange={(e) => handleCategoryChange(e.target.value)}
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
              >
                <option value="">Select Sub Category</option>

                {(subCategories[product.category] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price"
                className="border p-4 rounded-xl"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Original Price"
                className="border p-4 rounded-xl"
                value={product.originalPrice}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    originalPrice: e.target.value,
                  })
                }
              />
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

            <p className="text-sm text-gray-500 mt-3">
              Note: colours, sizes and stock are edited from the
              Variant Editor on the Products page, not here.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">Images</h2>

            {existingImages.length > 0 && (
              <div className="mb-5">
                <p className="font-semibold mb-2">
                  Current Images
                </p>

                <div className="flex gap-3 flex-wrap">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
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

            <p className="font-semibold mb-2">Add New Images</p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleNewImages(e.target.files)}
            />

            {newImages.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-5">
                {newImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt=""
                      className="w-24 h-24 object-cover rounded-xl"
                    />

                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
                      title="Remove image"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
