import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/apiUrl";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reviews/admin/all`, {
        params: rating ? { rating } : {},
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });
      setReviews(response.data.reviews || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [rating]);

  const changeStatus = async (reviewId, status) => {
    await axios.patch(
      `${API_URL}/reviews/admin/${reviewId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } }
    );
    loadReviews();
  };

  const removeReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
    });
    loadReviews();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} Stars</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="font-bold">{review.product?.name || "Unknown product"}</h2>
                  <p className="text-sm text-gray-500">{review.userName} · {review.rating} Stars</p>
                </div>
                <span className="text-sm">{review.status}</span>
              </div>
              <p className="mt-3">{review.comment}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => changeStatus(review._id, "published")} className="px-4 py-2 rounded bg-green-600 text-white">Publish</button>
                <button onClick={() => changeStatus(review._id, "hidden")} className="px-4 py-2 rounded bg-yellow-500 text-white">Hide</button>
                <button onClick={() => removeReview(review._id)} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
