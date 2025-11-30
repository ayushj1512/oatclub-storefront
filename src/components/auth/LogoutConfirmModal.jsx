"use client";

import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

export default function LogoutConfirmModal() {
  const { user, showLogoutConfirm, cancelLogout, confirmLogout } = useAuthStore();

  const safeName =
    user?.name?.length > 1
      ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
      : "there";

  return (
    <AnimatePresence>
      {showLogoutConfirm && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
          onClick={cancelLogout}  // ⭐ CLICK OUTSIDE closes modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Center Modal */}
          <motion.div
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // ❗ Prevent closing when clicking inside
          >
            {/* Greeting */}
            <p className="text-gray-600 text-sm font-medium mb-1">
              Hey, {safeName}
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Logout
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmLogout}
                className="w-full py-3 rounded-xl bg-[#800020] text-white font-semibold hover:bg-[#6a001a] active:scale-[0.97] transition"
              >
                Log Out
              </button>

              <button
                onClick={cancelLogout}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:scale-[0.97] transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
