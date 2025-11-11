"use client";

export default function AddressBookPage() {
  return (
    <section className="p-10">
      <h1 className="text-3xl font-semibold mb-6">My Addresses</h1>
      <div className="border rounded-2xl p-5">
        <p className="text-gray-600 mb-4">No saved addresses yet.</p>
        <button className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition">
          Add New Address
        </button>
      </div>
    </section>
  );
}
