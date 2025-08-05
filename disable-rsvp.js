// Helper to parse Singapore time
function parseSGDate(dateStr) {
  // Convert "21 September 2025" → "2025-09-21T23:59:59+08:00"
  const [day, monthName, year] = dateStr.split(" ");
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  const month = months[monthName];
  const isoString = `${year}-${month}-${day.padStart(2, "0")}T23:59:59+08:00`;
  return new Date(isoString);
}

const fallbackDeadline = parseSGDate("21 September 2025");
let deadline = fallbackDeadline;

// Try to get date from localStorage
try {
  const stored = localStorage.getItem("event_dates");
  if (stored) {
    const eventDates = JSON.parse(stored);
    if (eventDates.church_rsvp_by) {
      deadline = parseSGDate(eventDates.church_rsvp_by);
    }
  }
} catch (e) {
  console.warn("Failed to get event dates from localStorage:", e);
}

// Check current date/time in Singapore timezone
const now = new Date(); // This is local browser time

// Create and insert the RSVP button
const rsvpContainer = document.getElementById("rsvp-button");
const rsvpButton = document.createElement("a");
rsvpButton.classList.add("button");

// If the current time is past the deadline, disable the button
// Otherwise, set the button to link to the RSVP page
if (now > deadline) {
  rsvpButton.disabled = true;
  rsvpButton.textContent = "RSVP Closed";
  rsvpButton.classList.add("disabled");
} else {
  rsvpButton.href = "/rsvp.html";
  rsvpButton.textContent = "RSVP Now";
}

rsvpContainer.appendChild(rsvpButton);
