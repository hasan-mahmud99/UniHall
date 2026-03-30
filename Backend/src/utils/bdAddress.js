const bd = require("bangladesh-districts-upazilas");

const SPECIAL_DISTRICTS = ["Abroad"];
const DISTRICT_DISPLAY_FIXUPS = {
  // Dataset misspelling fix
  Norsingdi: "Narsingdi",
};

function applyDistrictDisplayFix(name) {
  const normalized = String(name || "").trim();
  return DISTRICT_DISPLAY_FIXUPS[normalized] || normalized;
}

function resolveDistrictForDataset(input) {
  const raw = normalizeName(input);
  if (!raw) return "";

  // Allow special virtual districts
  if (SPECIAL_DISTRICTS.some((d) => d.toLowerCase() === raw.toLowerCase())) {
    // Return canonical casing from SPECIAL_DISTRICTS
    return SPECIAL_DISTRICTS.find((d) => d.toLowerCase() === raw.toLowerCase());
  }

  // Accept corrected spelling but resolve to dataset spelling
  if (raw.toLowerCase() === "narsingdi") return "Norsingdi";
  return raw;
}

function normalizeName(value) {
  return String(value || "").trim();
}

function listDistrictNames() {
  const districts = bd.getAllDistricts();
  const names = (Array.isArray(districts) ? districts : [])
    .map((d) => applyDistrictDisplayFix(normalizeName(d?.name)))
    .filter(Boolean);

  const combined = [...SPECIAL_DISTRICTS, ...names];
  return Array.from(new Set(combined)).sort((a, b) => a.localeCompare(b));
}

function listUpazilaNamesByDistrict(districtName) {
  const district = resolveDistrictForDataset(districtName);
  if (!district) return [];

  // Special districts have no real upazila list.
  if (SPECIAL_DISTRICTS.includes(district)) return ["N/A"];

  if (!bd.isValidDistrict(district)) return [];

  const upazilas = bd.getUpazilasByDistrict(district);
  const names = (Array.isArray(upazilas) ? upazilas : [])
    .map((u) => normalizeName(u?.name))
    .filter(Boolean);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

function isValidDistrict(districtName) {
  const district = resolveDistrictForDataset(districtName);
  if (!district) return false;
  if (SPECIAL_DISTRICTS.includes(district)) return true;
  return bd.isValidDistrict(district);
}

function isValidUpazila(upazilaName) {
  return bd.isValidUpazila(normalizeName(upazilaName));
}

module.exports = {
  listDistrictNames,
  listUpazilaNamesByDistrict,
  isValidDistrict,
  isValidUpazila,
};
