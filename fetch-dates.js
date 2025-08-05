const EVENT_STORAGE_KEY = "event_dates";
const EXPIRY_KEY = "event_dates_expiry";
const CACHE_DURATION_HOURS = 4;

// Helper to check if the cache is expired
function isCacheExpired() {
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!expiry) return true;
  return new Date().getTime() > parseInt(expiry, 10);
}

// Helper to fetch and store fresh data
async function fetchAndStoreEventDates() {
  try {
    const res = await fetch("/api/get-dates");
    const data = await res.json();
    if (typeof data === "object" && data !== null) {
      localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(data));
      const nextExpiry = Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000;
      localStorage.setItem(EXPIRY_KEY, nextExpiry.toString());
      return data;
    } else {
      throw new Error("Invalid data structure");
    }
  } catch (err) {
    console.error("❌ Failed to fetch event dates:", err);
    return null;
  }
}

function replaceTextInPage(findText, replaceWith) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.includes(findText)) {
      node.nodeValue = node.nodeValue.replaceAll(findText, replaceWith);
    }
  }
}

// Initialize data on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  let eventDates = null;

  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    eventDates = stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn("⚠️ Corrupted event_dates, clearing...");
    localStorage.removeItem(EVENT_STORAGE_KEY);
    eventDates = null;
  }

  const needsUpdate =
    !eventDates || Object.keys(eventDates).length === 0 || isCacheExpired();

  if (needsUpdate) {
    const fetchedData = await fetchAndStoreEventDates();
    if (fetchedData) {
      eventDates = fetchedData;
    } else {
      console.warn("⚠️ No valid data fetched, using defaults.");
    }
  }

  // e.g., update UI
  replaceTextInPage(
    "{{dinner_rsvp_by}}",
    eventDates.dinner_rsvp_by ?? "24 August 2025"
  );
  replaceTextInPage(
    "{{church_rsvp_by}}",
    eventDates.church_rsvp_by ?? "21 September 2025"
  );
  replaceTextInPage("{{mass_time}}", eventDates.mass_time ?? "2.30PM");
  replaceTextInPage(
    "{{tea_ceremony_time}}",
    eventDates.tea_ceremony_time ?? "5.30PM"
  );
  replaceTextInPage(
    "{{cocktail_reception_time}}",
    eventDates.cocktail_reception_time ?? "6.30PM"
  );
  replaceTextInPage("{{dinner_time}}", eventDates.dinner_time ?? "7.15PM");
});
