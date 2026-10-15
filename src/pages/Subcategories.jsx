
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import adminApi from "../api/client";

const categories = [
  "Men",
  "Women",
  "Kids",
  "Jewellery",
  "Mens-Cosmetics",
  "Womens-Cosmetics",
  "Kids-Cosmetics",
  "New Born",
];

const emptyForm = {
  name: "",
  category: "Men",
  image: "",
  description: "",
  displayOrder: 0,
  isActive: true,
};

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchSubcategories = async () => {
    try {
      setPageLoading(true);

      const response = await adminApi.get("/subcategories");

      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error("Failed to load subcategories:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load subcategories"
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const image = form.image.trim();

    if (!name) {
      alert("Please enter subcategory name");
      return;
    }

    if (!image) {
      alert("Please enter subcategory image URL");
      return;
    }

    try {
      setLoading(true);

      const data = {
        name,
        category: form.category,
        image,
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await adminApi.put(
          `/subcategories/${editingId}`,
          data
        );

        alert("Subcategory updated successfully");
      } else {
        await adminApi.post("/subcategories", data);

        alert("Subcategory added successfully");
      }

      resetForm();
      await fetchSubcategories();
    } catch (error) {
      console.error("Subcategory save error:", error);

      alert(
        error.response?.data?.message ||
          "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (subcategory) => {
    setEditingId(subcategory._id);

    setForm({
      name: subcategory.name || "",
      category: subcategory.category || "Men",
      image: subcategory.image || "",
      description: subcategory.description || "",
      displayOrder: subcategory.displayOrder ?? 0,
      isActive: subcategory.isActive !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleSubcategory = async (subcategory) => {
    const action = subcategory.isActive ? "hide" : "restore";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${subcategory.name}"?`
    );

    if (!confirmed) return;

    try {
      await adminApi.patch(
        `/subcategories/${subcategory._id}/toggle`
      );

      await fetchSubcategories();
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error.response?.data?.message ||
          "Status update failed"
      );
    }
  };

  const deleteSubcategory = async (subcategory) => {
    const confirmed = window.confirm(
      `Hide "${subcategory.name}" from the website?`
    );

    if (!confirmed) return;

    try {
      await adminApi.delete(
        `/subcategories/${subcategory._id}`
      );

      await fetchSubcategories();
    } catch (error) {
      console.error("Hide subcategory error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to hide subcategory"
      );
    }
  };

  const filteredSubcategories = subcategories.filter(
    (subcategory) =>
      selectedCategory === "All" ||
      subcategory.category === selectedCategory
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Subcategory Management
          </h1>

          <p className="mt-2 text-gray-500">
            Add, edit, hide and restore website subcategories.
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Subcategory" : "Add Subcategory"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Main Category
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value)
                  }
                  className="w-full rounded-xl border p-4"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Subcategory Name
                </label>

                <input
                  type="text"
                  placeholder="Example: Trunks"
                  value={form.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  className="w-full rounded-xl border p-4"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Subcategory Photo URL
              </label>

              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(event) =>
                  handleChange("image", event.target.value)
                }
                className="w-full rounded-xl border p-4"
                required
              />
            </div>

            {form.image && (
              <div className="w-full md:w-72">
                <p className="mb-2 font-semibold">Preview</p>

                <img
                  src={form.image}
                  alt="Subcategory preview"
                  className="h-48 w-full rounded-2xl border object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
                  }}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">
                Description
              </label>

              <textarea
                rows={4}
                placeholder="Optional description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                className="w-full resize-none rounded-xl border p-4"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(event) =>
                    handleChange("displayOrder", event.target.value)
                  }
                  className="w-full rounded-xl border p-4"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Smaller numbers appear first.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Status
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      handleChange("isActive", event.target.checked)
                    }
                    className="h-5 w-5"
                  />

                  <span>Active</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-8 py-4 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Subcategory"
                  : "Add Subcategory"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow sm:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">
              All Subcategories
            </h2>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              className="rounded-xl border p-3"
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {pageLoading ? (
            <div className="py-16 text-center">
              Loading subcategories...
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No subcategories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubcategories.map((subcategory) => (
                <div
                  key={subcategory._id}
                  className={`overflow-hidden rounded-2xl border ${
                    subcategory.isActive
                      ? "bg-white"
                      : "bg-gray-100 opacity-70"
                  }`}
                >
                  <img
                    src={
                      subcategory.image ||
                      "https://via.placeholder.com/500x300?text=No+Image"
                    }
                    alt={subcategory.name}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-purple-600">
                          {subcategory.category}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {subcategory.name}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          subcategory.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {subcategory.isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-500">
                      Products:{" "}
                      <strong>
                        {subcategory.productCount ?? 0}
                      </strong>
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Order: {subcategory.displayOrder ?? 0}
                    </p>

                    {subcategory.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                        {subcategory.description}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(subcategory)}
                        className="rounded-xl bg-black py-3 font-semibold text-white hover:bg-gray-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSubcategory(subcategory)}
                        className={`rounded-xl py-3 font-semibold ${
                          subcategory.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {subcategory.isActive ? "Hide" : "Restore"}
                      </button>
                    </div>

                    {subcategory.isActive &&
                      (subcategory.productCount ?? 0) === 0 && (
                        <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                          No products use this subcategory yet. It
                          may not appear on the frontend until
                          products are assigned to it.
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
