"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Login to Your Account</h1>
      <form className="flex flex-col gap-4 w-full max-w-md bg-white p-8 shadow rounded-2xl">
        <input
          type="email"
          placeholder="Email"
          className="border rounded-lg px-4 py-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded-lg px-4 py-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-pink-600 text-white py-3 rounded-full hover:bg-pink-700 transition">
          Login
        </button>
        <p className="text-sm text-center mt-2">
          Don’t have an account?{" "}
          <a href="/auth/register" className="text-pink-600 underline">
            Register
          </a>
        </p>
      </form>
    </section>
  );
}
