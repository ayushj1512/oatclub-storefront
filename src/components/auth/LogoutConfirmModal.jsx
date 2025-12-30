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
          onClick={cancelLogout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
          >
            <p className="text-gray-600 text-sm font-medium mb-1">
              Hey, {safeName}
            </p>

            <h3 className="text-xl font-bold text-black mb-2">
              Confirm Logout
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmLogout}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.97] transition"
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
