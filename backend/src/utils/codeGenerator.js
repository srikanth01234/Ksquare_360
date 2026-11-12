const Site = require('../models/Site');

/**
 * Generates site code in format: [CITY]-[MM]-[YYYY]-[CATEGORY]-[RUNNING_NO]
 * Example: CHN-11-2026-NB-01 or CHN-11-2026-RE-01
 *
 * @param {string} city - e.g. "Chennai", "Coimbatore"
 * @param {string} category - e.g. "New Building", "Renovation", "Interior", "Commercial"
 * @param {Date} [date] - Date to use (defaults to now)
 * @returns {Promise<string>} e.g. "CHN-11-2026-NB-01"
 */
async function generateSiteCode(city = 'Chennai', category = 'New Building', date = new Date()) {
  // 1. City 3-letter code
  const cityCodeMap = {
    chennai: 'CHN',
    coimbatore: 'CBE',
    madurai: 'MDU',
    trichy: 'TRY',
    salem: 'SLM',
    tirunelveli: 'TNV',
    bangalore: 'BLR',
    bengaluru: 'BLR',
    hyderabad: 'HYD',
  };

  const normalizedCity = city.trim().toLowerCase();
  const cityAbbr = cityCodeMap[normalizedCity] || city.substring(0, 3).toUpperCase();

  // 2. Month and Year
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  // 3. Category 2-letter code
  const categoryCodeMap = {
    'new building': 'NB',
    'renovation': 'RE',
    'interior': 'IN',
    'commercial': 'CM',
    'residential': 'NB',
    'commercial / multi-unit': 'CM',
  };

  const normalizedCategory = category.trim().toLowerCase();
  const catAbbr = categoryCodeMap[normalizedCategory] || 'NB';

  // 4. Prefix: CHN-11-2026-NB-
  const prefix = `${cityAbbr}-${mm}-${yyyy}-${catAbbr}-`;

  // 5. Find highest existing running number with this prefix
  const existingSites = await Site.find({
    code: { $regex: `^${prefix}` },
  }).select('code');

  let maxRunningNo = 0;
  existingSites.forEach((s) => {
    const parts = s.code.split('-');
    const numPart = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(numPart) && numPart > maxRunningNo) {
      maxRunningNo = numPart;
    }
  });

  const nextRunningNo = String(maxRunningNo + 1).padStart(2, '0');
  return `${prefix}${nextRunningNo}`;
}

module.exports = {
  generateSiteCode,
};

