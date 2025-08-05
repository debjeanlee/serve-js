const form = document.getElementById("rsvp");
const popup = document.getElementById("error-popup");
const success = document.getElementById("success-popup");
const loader = document.getElementById("full-page-loader");
const messageEl = document.getElementById("error-message");
const titleEl = document.getElementById("error-title");

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

function getErrorMessage(path) {
  switch (path) {
    case "phone":
      return "Your phone number is invalid.";
    case "email":
      return "Your email address doesn't look right.";
    case "full_name":
      return "Please put in your full name";
    case "rsvp_status":
      return "Don't leave this blank!";
    default:
      break;
  }
}
function handleErrors(errors) {
  if (errors.length > 1) {
    errors.forEach((err) => {
      const el = document.getElementById(err.path);
      const errEl = document.createElement("small");
      errEl.classList.add("error");
      errEl.innerHTML = getErrorMessage(err.path);
      el.after(errEl);
    });
  } else {
    const el = document.getElementById(errors.path);
    const errEl = document.createElement("small");
    errEl.classList.add("error");
    errEl.innerHTML = getErrorMessage(errors.path);
    el.after(errEl);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  loader.style.display = "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  document.querySelectorAll("small.error").forEach((el) => el.remove());

  loader.style.display = "flex";

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const body = JSON.stringify(data);
  try {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    const result = await res.json();
    if (result.error) {
      loader.style.display = "none";
      showErrorPopup(result.error);
    } else if (result[0]) {
      handleErrors(result);
    } else {
      form.reset();
      loader.style.display = "none";
      showSuccess();
    }
  } catch (error) {
    loader.style.display = "none";
    showErrorPopup(error);
  }
});
