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
  const [form, setForm] = useState(emptyForm);
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
        await adminApi.post(
          "/subcategories",
          data
        );

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

  const resetForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  };

  const toggleSubcategory = async (subcategory) => {
    const action = subcategory.isActive
      ? "hide"
      : "restore";

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

  const filteredSubcategories =
    subcategories.filter((subcategory) => {
      if (selectedCategory === "All") {
        return true;
      }

      return (
        subcategory.category ===
        selectedCategory
      );
    });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Subcategory Management
          </h1>

          <p className="text-gray-500 mt-2">
            Add, edit, hide and restore
            website subcategories.
          </p>
        </div>

        {/* FORM */}

        <div className="bg-white rounded-2xl shadow p-5 sm:p-8 mb-8">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              {editingId
                ? "Edit Subcategory"
                : "Add Subcategory"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* CATEGORY + NAME */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Main Category
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    handleChange(
                      "category",
                      event.target.value
                    )
                  }
                  className="w-full border p-4 rounded-xl"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Subcategory Name
                </label>

                <input
                  type="text"
                  placeholder="Example: Trunks"
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  className="w-full border p-4 rounded-xl"
                />
              </div>

            </div>

            {/* IMAGE */}

            <div>
              <label className="block font-semibold mb-2">
                Subcategory Photo URL
              </label>

              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(event) =>
                  handleChange(
                    "image",
                    event.target.value
                  )
                }
                className="w-full border p-4 rounded-xl"
              />
            </div>

            {/* IMAGE PREVIEW */}

            {form.image && (
              <div className="w-full md:w-72">

                <p className="font-semibold mb-2">
                  Preview
                </p>

                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl border"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

            {/* DESCRIPTION */}

            <div>
              <label className="block font-semibold mb-2">
                Description
              </label>

              <textarea
                rows="4"
                placeholder="Optional description"
                value={form.description}
                onChange={(event) =>
                  handleChange(
                    "description",
                    event.target.value
                  )
                }
                className="w-full border p-4 rounded-xl resize-none"
              />
            </div>

            {/* ORDER + ACTIVE */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(event) =>
                    handleChange(
                      "displayOrder",
                      event.target.value
                    )
                  }
                  className="w-full border p-4 rounded-xl"
                />

                <p className="text-sm text-gray-500 mt-2">
                  Smaller numbers appear first.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Status
                </label>

                <label className="flex items-center gap-3 border p-4 rounded-xl cursor-pointer">

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      handleChange(
                        "isActive",
                        event.target.checked
                      )
                    }
                    className="w-5 h-5"
                  />

                  <span>
                    Active
                  </span>

                </label>
              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Subcategory"
                : "Add Subcategory"}
            </button>

          </form>
        </div>

        {/* LIST */}

        <div className="bg-white rounded-2xl shadow p-5 sm:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <h2 className="text-2xl font-bold">
              All Subcategories
            </h2>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
              className="border p-3 rounded-xl"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredSubcategories.map(
                (subcategory) => (

                  <div
                    key={subcategory._id}
                    className={`border rounded-2xl overflow-hidden ${
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
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="text-sm text-purple-600 font-bold">
                            {subcategory.category}
                          </p>

                          <h3 className="text-xl font-bold mt-1">
                            {subcategory.name}
                          </h3>

                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold ${
                            subcategory.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {subcategory.isActive
                            ? "ACTIVE"
                            : "HIDDEN"}
                        </span>

                      </div>

                      <p className="text-gray-500 mt-3">
                        Products:{" "}
                        <strong>
                          {subcategory.productCount ?? 0}
                        </strong>
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        Order:{" "}
                        {subcategory.displayOrder ?? 0}
                      </p>

                      {subcategory.description && (
                        <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                          {subcategory.description}
                        </p>
                      )}

                      {/* BUTTONS */}

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(subcategory)
                          }
                          className="bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleSubcategory(
                              subcategory
                            )
                          }
                          className={`py-3 rounded-xl font-semibold ${
                            subcategory.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {subcategory.isActive
                            ? "Hide"
                            : "Restore"}
                        </button>

                      </div>

                      {/* NO PRODUCTS */}

                      {subcategory.isActive &&
                        (subcategory.productCount ?? 0) ===
                          0 && (
                          <div className="mt-4 bg-yellow-50 text-yellow-700 rounded-xl p-3 text-sm">
                            No products use this
                            subcategory yet. It
                            will not appear on
                            the frontend.
                          </div>
                        )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>
    </Layout>
  );
}