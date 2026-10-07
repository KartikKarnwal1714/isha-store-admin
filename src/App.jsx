import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import AddBrand from "./pages/AddBrand";
import Products from "./pages/Products";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import UploadProducts from "./pages/UploadProducts";
import AddCoupon from "./pages/AddCoupon";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Subcategories from "./pages/Subcategories";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-products"
          element={
            <ProtectedRoute>
              <UploadProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-brand"
          element={
            <ProtectedRoute>
              <AddBrand />
            </ProtectedRoute>
          }
        />

        <Route
  path="/subcategories"
  element={
    <ProtectedRoute>
      <Subcategories />
    </ProtectedRoute>
  }
/>

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-coupon"
          element={
            <ProtectedRoute>
              <AddCoupon />
            </ProtectedRoute>
          }
        />

<Route path="/customers" element={<Customers />} />

<Route path="/customers/:id" element={<CustomerDetails />} />

      </Routes>
    </BrowserRouter>
  );
}