// services/cartService.js
function segregateProducts(items = []) {
  const grouped = { seeds: [], pesticides: [], ppe: [], others: [] };

  for (const it of items) {
    const cat = String(it.category || "").toLowerCase();
    if (cat.includes("seed")) grouped.seeds.push(it);
    else if (cat.includes("pesticide")) grouped.pesticides.push(it);
    else if (cat.includes("ppe")) grouped.ppe.push(it);
    else grouped.others.push(it);
  }
  return grouped;
}

module.exports = { segregateProducts };
