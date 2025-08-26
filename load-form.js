// const formFields = [
//   "id",
//   "full_name",
//   "email",
//   "phone",
//   "rsvp_status",
//   "meal_preferences",
//   "require_transport",
//   "transport_no_pax",
//   "no_guests_attending",
//   "names_of_guests_attending",
//   "notes",
//   "date_submitted",
//   "date_edited",
// ];
// === DOM References ===
const rsvpStatus = document.getElementById("rsvp_status");
const transportSection = document.getElementById("transport");
const guestDetailsSection = document.getElementById("guest-details");
const transportNoPaxInput = document.getElementById("transport_no_pax");

// === Helpers ===
let isTransitioning = false;

// Toggle a class with optional delay if transitioning
const toggleClass = (element, className, add) => {
  const apply = () => element.classList[add ? "add" : "remove"](className);
  isTransitioning ? setTimeout(apply, 100) : apply();
};

// === Event Listeners ===

// Clear "0" on click for number inputs
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("click", () => {
    if (input.value === "0") input.value = "";
  });

  // Reset empty input to "0" on blur
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") input.value = 0;
  });
});

// Set transport pax to 0 if transport is "No"
document
  .querySelectorAll('input[name="require_transport"]')
  .forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "No") {
        transportNoPaxInput.value = 0;
      }
    });
  });

// Track transitions for smooth toggleClass handling
[transportSection, guestDetailsSection].forEach((el) => {
  el.addEventListener("transitionstart", () => (isTransitioning = true));
  el.addEventListener("transitionend", () => (isTransitioning = false));
});

// Handle RSVP Status change to show/hide relevant sections
rsvpStatus?.addEventListener("change", (e) => {
  const value = e.target.value;

  toggleClass(transportSection, "open", value === "Church Mass & Dinner");
  toggleClass(
    guestDetailsSection,
    "open",
    value !== "Not Attending" && value !== ""
  );
});

// hide rsvp for dinner after 24 August 2025
function parseSGDate(dateStr) {
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

function limitRSVPOptionsIfPastDeadline() {
  const fallbackDeadline = parseSGDate("1 September 2025");
  let deadline = fallbackDeadline;

  try {
    const stored = localStorage.getItem("event_dates");
    if (stored) {
      const eventDates = JSON.parse(stored);
      if (eventDates.dinner_rsvp_by) {
        deadline = parseSGDate(eventDates.dinner_rsvp_by);
      }
    }
  } catch (e) {
    console.warn("Could not parse event dates from localStorage:", e);
  }

  const now = new Date();
  if (now > deadline) {
    // Remove the options after the deadline
    const rsvpSelect = document.getElementById("rsvp_status");
    if (rsvpSelect) {
      [...rsvpSelect.options].forEach((opt) => {
        if (
          opt.value === "Church Mass & Dinner" ||
          opt.value === "Just Dinner"
        ) {
          opt.remove();
        }
        if (opt.value === "Just Church Mass") {
          opt.textContent = "Yes!"; // Select "Not Attending" if available
        }
      });
    }

    // Hide transport section
    const transportSection = document.getElementById("transport");
    if (transportSection) {
      transportSection.style.display = "none";
    }
  }
}

function hideFormIfPastDeadline() {
  const formWrapper = document.getElementById("rsvp-form");
  const fallbackDeadline = parseSGDate("30 September 2025");
  let churchRSVPBy = fallbackDeadline;

  try {
    // Try from localStorage
    const eventDates = localStorage.getItem("event_dates");
    if (eventDates) {
      const parsed = JSON.parse(eventDates);
      churchRSVPBy = parsed?.church_rsvp_by;
    }

    // Check deadline
    if (churchRSVPBy) {
      // Convert to Date in Singapore timezone
      const deadline = parseSGDate(churchRSVPBy);
      const now = new Date();

      if (now > deadline) {
        if (formWrapper) {
          formWrapper.style.display = "none";
        }

        // Optionally show message
        const container = document.querySelector(
          "section[class='container rsvp']"
        );

        container.innerHTML = `<h2>RSVP's are closed</h2>
                <p>If you barely missed the deadline, please reach out to us personally to RSVP. <br/> Thank you!</p> 
                <p> Gabriel
                <a href="https://wa.me/6597290552" target="_blank" class="link"
                  >97290552</a
                >
                <br />
                Deborah
                <a href="https://wa.me/6594524301" target="_blank" class="link"
                  >94524301</a
                ></p>`;
      }
    }
  } catch (error) {
    console.error("Failed to load or compare RSVP date:", error);
  }
}

// Run on DOM load
document.addEventListener("DOMContentLoaded", () => {
  limitRSVPOptionsIfPastDeadline();
  hideFormIfPastDeadline();
});
