import { useState } from "react";
import adminApi from "../api/client";
import Layout from "../components/Layout";

export default function UploadProducts() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select Excel file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await adminApi.post(
        "/products/import-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(
        `${res.data.count} products imported successfully`
      );

      setFile(null);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Excel upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow">
        <h1 className="text-4xl font-bold mb-6">
          Upload Products By Excel
        </h1>

        <div className="mb-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="font-semibold mb-2">
            Accepted column headers (case-insensitive, extra spaces are fine):
          </p>
          <p>
            name, brand, category, sub category, male female (gender /
            audience — also used for Jewellery&apos;s jewellery-for value),
            description, price, original price, featured, color name, color
            code, image, size, stock, size price, size original price, sku,
            barcode.
          </p>
          <p className="mt-2">
            If a sheet&apos;s <span className="font-semibold">category</span>{" "}
            value isn&apos;t one of Men / Women / Kids / Jewellery /
            Mens-Cosmetics / Womens-Cosmetics / Kids-Cosmetics (e.g. a
            supplier sheet says &quot;hair color&quot;), it&apos;s
            automatically placed under the closest cosmetics category using
            the male female column, and the original text is kept as the sub
            category — the row still imports instead of failing.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            className="border p-4 rounded-xl w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload Excel"}
          </button>
        </form>
      </div>
    </Layout>
  );
}