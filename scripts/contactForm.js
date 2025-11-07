// contactForm.js — minimal network + UX improvements
const form = document.getElementById("contact-form");
if (form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const alertBox = document.getElementById("alert");
  const alertMessage = alertBox?.querySelector("p");
  const closeBtn = alertBox?.querySelector("button");

  const showAlert = (msg, isError = false) => {
    if (!alertBox) return;
    alertMessage.textContent = msg;
    alertBox.classList.toggle("error", isError);
    alertBox.classList.add("show");
  };

  const hideAlert = () => alertBox?.classList.remove("show", "error");

  closeBtn?.addEventListener("click", hideAlert);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // basic validation before network
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();
    if (!name || !email || !message) {
      showAlert("Please fill out all fields.", true);
      return;
    }

    fd.append("access_key", "d3616c5e-24f5-4180-b6de-effda302a494"); // TODO: set your real key

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    // Abort if it hangs >10s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showAlert(
          "Success! Your message has been sent. Expect us in your inbox soon."
        );
        form.reset();
      } else {
        showAlert(`Error: ${data.message || "Failed to submit."}`, true);
      }
    } catch (err) {
      const reason =
        err?.name === "AbortError"
          ? "Timed out. Check your connection."
          : "Something went wrong. Please try again.";
      showAlert(reason, true);
    } finally {
      clearTimeout(timeout);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
