document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.contains("open");

    // Close all
    document
      .querySelectorAll(".faq-answer")
      .forEach((a) => a.classList.remove("open"));
    document
      .querySelectorAll(".faq-question")
      .forEach((q) => q.classList.remove("open"));

    // Toggle current
    if (!isOpen) {
      answer.classList.add("open");
      btn.classList.add("open");
    }
  });
});
