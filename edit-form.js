// === Cached DOM References ===
const formSection = document.getElementById("update-section");
let originalFormHTML = formSection.innerHTML;

const loader = document.getElementById("full-page-loader");
const popup = document.getElementById("error-popup");
const success = document.getElementById("success-popup");
const messageEl = document.getElementById("error-message");
const titleEl = document.getElementById("error-title");

// === Disable Edit RSVP Button if Past Deadline ===
(function () {
  let deadline;
  try {
    const stored = localStorage.getItem("event_dates");
    if (stored) {
      const eventDates = JSON.parse(stored);
      if (eventDates.church_rsvp_by) {
        // Parse date in YYYY-MM-DD format
        deadline = new Date(eventDates.church_rsvp_by + "T23:59:59+08:00");
      }
    }
  } catch (e) {
    console.warn("Failed to get event dates from localStorage:", e);
  }

  const now = new Date();
  const editBtn = document.getElementById("edit-btn");
  if (editBtn && deadline && now > deadline) {
    editBtn.disabled = true;
    editBtn.textContent = "RSVP Editing Closed";
    editBtn.classList.add("disabled");
  }
})();

// === Toggle class helper with transition awareness ===
let isTransitioning = false;
const toggleClass = (element, className, add) => {
  const apply = () => element.classList[add ? "add" : "remove"](className);
  isTransitioning ? setTimeout(apply, 100) : apply();
};

// === Main Form Logic ===
function addEventListeners() {
  // Clear "0" on number input click
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("click", () => {
      if (input.value === "0") input.value = "";
    });

    input.addEventListener("blur", () => {
      if (input.value === "") input.value = 0;
    });
  });

  const transportNoPaxInput = document.getElementById("transport_no_pax");
  const transportRadios = document.querySelectorAll(
    'input[name="require_transport"]'
  );

  // When transport changes to "No", reset pax count
  transportRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked && radio.value === "No") {
        transportNoPaxInput.value = 0;
      }
    });
  });

  const transportSection = document.getElementById("transport");
  const guestDetailsSection = document.getElementById("guest-details");

  [transportSection, guestDetailsSection].forEach((el) => {
    el.addEventListener("transitionstart", () => (isTransitioning = true));
    el.addEventListener("transitionend", () => (isTransitioning = false));
  });

  const rsvpStatus = document.getElementById("rsvp_status");
  rsvpStatus.addEventListener("change", (e) => {
    const value = e.target.value;
    toggleClass(transportSection, "open", value === "Church Mass & Dinner");
    toggleClass(
      guestDetailsSection,
      "open",
      value !== "Not Attending" && value !== ""
    );
  });
}

// === Form Reset & Rebind Logic ===
function reinitializeForm() {
  formSection.innerHTML = originalFormHTML;
  formSection.scrollIntoView({ behavior: "smooth", block: "start" });

  const newForm = document.getElementById("update-rsvp");
  const newCancelBtn = document.getElementById("cancel-edit");

  newForm.addEventListener("submit", handleSubmit);
  newCancelBtn.addEventListener("click", () => reinitializeForm());

  addEventListeners();
}

// === Toggle Between Form & Info View ===
function toggleShowForm() {
  const infoSection = document.getElementById("info-section");
  const isHidden =
    formSection.style.display === "none" || !formSection.style.display;

  formSection.style.display = isHidden ? "block" : "none";
  infoSection.style.display = isHidden ? "none" : "block";

  formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// === Submit Handler (shared by both initial and re-cloned forms) ===
async function handleSubmit(e) {
  e.preventDefault();
  document.querySelectorAll("small.error").forEach((el) => el.remove());

  loader.style.display = "flex";

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const cleaned = cleanData(data);

  try {
    const res = await fetch("/api/update-rsvp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned),
    });

    const result = await res.json();

    if (result.error) {
      showErrorPopup(result.error);
    } else if (Array.isArray(result) && result.length) {
      handleErrors(result);
    } else {
      e.target.reset();
      showSuccess();
    }
  } catch (error) {
    showErrorPopup(error);
  } finally {
    loader.style.display = "none";
  }
}

// === Error Display Helpers ===
function showErrorPopup(error) {
  messageEl.innerHTML = error.message ?? "";
  titleEl.innerHTML = error.title ?? "Something went wrong!";
  popup.classList.remove("hidden");
}

function closeErrorPopup() {
  popup.classList.add("hidden");
}

function showSuccess() {
  success.classList.remove("hidden");
}

function closeSuccess() {
  window.location.replace("/index.html");
}

// === Per-field error display ===
function getErrorMessage(path) {
  switch (path) {
    case "phone":
      return "Your phone number is invalid.";
    case "email":
      return "Your email address doesn't look right.";
    case "full_name":
      return "Please put in your full name.";
    case "rsvp_status":
      return "Don't leave this blank!";
    default:
      return "There was an error with your input.";
  }
}

function handleErrors(errors) {
  (Array.isArray(errors) ? errors : [errors]).forEach((err) => {
    const el = document.getElementById(err.path);
    if (el) {
      const errEl = document.createElement("small");
      errEl.classList.add("error");
      errEl.innerHTML = getErrorMessage(err.path);
      el.after(errEl);
    }
  });

  const firstError = Array.isArray(errors) ? errors[0] : errors;
  document
    .getElementById(firstError.path)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// === Clean form data before submission based on RSVP choice ===
function cleanData(body) {
  const cleaned = { ...body };

  if (cleaned.rsvp_status === "Not Attending") {
    cleaned.dietary_requirements = "";
    cleaned.require_transport = "";
    cleaned.transport_no_pax = 0;
    cleaned.no_guests_attending = 0;
    cleaned.names_of_guests_attending = "";
  }

  if (["Just Church Mass", "Just Dinner"].includes(cleaned.rsvp_status)) {
    cleaned.require_transport = "";
    cleaned.transport_no_pax = 0;
  }

  return cleaned;
}

// === Initial Bindings ===
document
  .getElementById("cancel-edit")
  .addEventListener("click", () => reinitializeForm());

document.getElementById("update-rsvp").addEventListener("submit", handleSubmit);

addEventListeners();
