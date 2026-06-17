export const mapItem = (p, qty = 1) => ({
  item_id: p._id || p.id,
  item_name: p.name || p.title,
  item_category: p.category?.name || p.category || "",
  item_variant: p.variant || p.size || "",
  price: Number(p.price || 0),
  quantity: qty,
  item_brand: "Oatclub",
});
