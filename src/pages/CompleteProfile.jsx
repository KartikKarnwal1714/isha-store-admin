import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/apiUrl";

export default function CompleteProfile() {
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer")) || {};

  const [form, setForm] = useState({
    phone: customer.phone || "",
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/users/complete-profile`,
        form
      );

      localStorage.setItem(
        "customer",
        JSON.stringify(res.data.user)
      );

      alert("Profile completed successfully");

      navigate("/");
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "Profile save failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-[24px] sm:rounded-[35px] shadow-xl overflow-hidden">
        <div className="bg-black text-white px-6 sm:px-10 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-black">
            Complete Your Profile
          </h1>
          <p className="text-gray-300 mt-2">
            Add your details once for faster checkout and delivery.
          </p>
        </div>

        <div className="p-6 sm:p-10 grid md:grid-cols-2 gap-5">
          <Input
            label="Full Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Phone Number *"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="House / Street / Area *"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <Input
            label="City *"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <Input
            label="State *"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <Input
            label="Pincode *"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          />

          <Input
            label="Landmark"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
          />

          <button
            onClick={handleSave}
            className="md:col-span-2 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition mt-5"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, disabled }) {
  return (
    <div>
      <label className="text-sm text-gray-500 font-semibold">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border px-5 py-4 rounded-2xl mt-2 outline-none disabled:bg-gray-100"
      />
    </div>
  );
}