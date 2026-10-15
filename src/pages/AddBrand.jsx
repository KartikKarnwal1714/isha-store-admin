import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_URL as BASE_API_URL } from "../utils/apiUrl";

export default function AddBrand() {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState("");

  const [brand, setBrand] = useState({
    bannerImage: "",
    tagline: "",
    name: "",
    nameColor: "#000000",
    brandImage: "",
  });

  const API_URL = `${BASE_API_URL}/brands`;

  const fetchBrands = async () => {
    try {
      const res = await axios.get(API_URL);
      setBrands(res.data.brands || []);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleChange = (field, value) => {
    setBrand({
      ...brand,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand.name.trim()) {
      alert("Please enter brand name");
      return;
    }

    if (!brand.brandImage.trim()) {
      alert("Please enter brand image URL");
      return;
    }

    try {
      setLoading(true);

      await axios.post(API_URL, {
        bannerImage: brand.bannerImage.trim(),
        tagline: brand.tagline.trim(),
        name: brand.name.trim(),
        nameColor: brand.nameColor,
        brandImage: brand.brandImage.trim(),
      });

      alert("Brand Added Successfully");

      setBrand({
        bannerImage: "",
        tagline: "",
        name: "",
        nameColor: "#000000",
        brandImage: "",
      });

      fetchBrands();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Brand Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await axios.delete(`${API_URL}/${id}`);

      alert("Brand Deleted Successfully");

      setBrands((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Brand Delete Failed");
    } finally {
      setDeleteLoading("");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Add Brand</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-2">Brand Banner</h2>

            <p className="text-gray-500 mb-6">
              Banner image and tagline are optional. If added, they will show in
              the frontend brand slider.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="url"
                placeholder="Banner Image URL Optional"
                className="border p-4 rounded-xl"
                value={brand.bannerImage}
                onChange={(e) =>
                  handleChange("bannerImage", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Tagline Optional"
                className="border p-4 rounded-xl"
                value={brand.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
              />
            </div>

            {brand.bannerImage && (
              <div className="mt-6 relative rounded-2xl overflow-hidden h-72">
                <img
                  src={brand.bannerImage}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-5">
                  <h3
                    className="text-4xl font-bold"
                    style={{ color: brand.nameColor }}
                  >
                    {brand.name || "Brand Name"}
                  </h3>

                  {brand.tagline && (
                    <p className="text-white text-lg mt-3">
                      {brand.tagline}
                    </p>
                  )}

                  <button
                    type="button"
                    className="mt-5 bg-white text-black px-6 py-3 rounded-xl font-semibold"
                  >
                    Explore Brand
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">Brand Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                type="text"
                placeholder="Brand Name *"
                className="border p-4 rounded-xl"
                value={brand.name}
                required
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <div className="border p-4 rounded-xl flex items-center gap-4">
                <label className="font-semibold whitespace-nowrap">
                  Name Color
                </label>

                <input
                  type="color"
                  className="h-10 w-full"
                  value={brand.nameColor}
                  onChange={(e) =>
                    handleChange("nameColor", e.target.value)
                  }
                />
              </div>

              <input
                type="url"
                placeholder="Brand Image URL *"
                className="border p-4 rounded-xl"
                value={brand.brandImage}
                required
                onChange={(e) =>
                  handleChange("brandImage", e.target.value)
                }
              />
            </div>

            {brand.brandImage && (
              <div className="mt-8 max-w-sm">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer group">
                  <img
                    src={brand.brandImage}
                    alt="Brand Preview"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3
                      className="text-4xl font-bold text-center"
                      style={{ color: brand.nameColor }}
                    >
                      {brand.name || "Brand Name"}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-10 py-5 rounded-2xl text-xl font-bold disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Create Brand"}
          </button>
        </form>

        <div className="mt-12 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-3xl font-bold mb-6">All Brands</h2>

          {brands.length === 0 ? (
            <p className="text-gray-500">No brands added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brands.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-2xl overflow-hidden shadow-sm"
                >
                  <img
                    src={item.brandImage}
                    alt={item.name}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-2xl font-bold">{item.name}</h3>

                    {item.tagline && (
                      <p className="text-gray-500 mt-2">{item.tagline}</p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteBrand(item._id, item.name)
                      }
                      disabled={deleteLoading === item._id}
                      className="mt-5 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {deleteLoading === item._id
                        ? "Deleting..."
                        : "Delete Brand"}
                    </button>
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