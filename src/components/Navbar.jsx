import {
  FaBars,
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
} from "react-icons/fa";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import adminApi from "../api/client";
import io from "socket.io-client";
import { API_URL } from "../utils/apiUrl";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

const socket = io(SOCKET_URL);

export default function Navbar({ onMenuClick }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("adminTheme") === "dark"
  );

  const audioRef = useRef(null);

  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.mp3");
    }

    audioRef.current.currentTime = 0;

    audioRef.current.play().catch((error) => {
      console.log("Sound blocked until user interacts:", error);
    });
  };

  const fetchNotifications = async () => {
    try {
      const res = await adminApi.get(
        "/notifications"
      );

      setNotifications(res.data || []);
    } catch (err) {
      console.log("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    fetchNotifications();

    socket.on("newOrder", () => {
      playNotificationSound();
      fetchNotifications();
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("adminTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("adminTheme", "light");
    }
  }, [darkMode]);

  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  const markAsRead = async (id) => {
    try {
      await adminApi.put(
        `/notifications/${id}/read`
      );

      fetchNotifications();
    } catch (error) {
      console.log("Mark read error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.location.href = "/";
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white shadow-md px-4 sm:px-6 py-3 sm:py-4 rounded-2xl flex justify-between items-center gap-3 mb-6 sm:mb-8 transition">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden bg-gray-100 dark:bg-gray-800 p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition shrink-0"
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        <h1 className="text-lg sm:text-2xl font-bold truncate">
          Ecommerce Admin
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-100 dark:bg-gray-800 p-2.5 sm:p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowUserMenu(false);
            }}
            className="relative bg-gray-100 dark:bg-gray-800 p-2.5 sm:p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-4 w-[92vw] max-w-96 bg-white dark:bg-gray-900 dark:text-white shadow-xl rounded-xl border dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-4 font-bold border-b dark:border-gray-700 flex justify-between items-center">
                <span>Notifications</span>

                <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full">
                  {unreadCount} New
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500">
                  No Notifications
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => markAsRead(item._id)}
                      className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                        !item.isRead
                          ? "bg-red-50 dark:bg-red-950"
                          : ""
                      }`}
                    >
                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.message}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowDropdown(false);
            }}
          >
            <FaUserCircle
              size={36}
              className="cursor-pointer"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-56 max-w-[80vw] bg-white dark:bg-gray-900 dark:text-white shadow-xl rounded-xl border dark:border-gray-700 z-50 overflow-hidden">
              <button className="w-full text-left px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                My Profile
              </button>

              <button className="w-full text-left px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}