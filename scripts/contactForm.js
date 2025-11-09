// contactForm.js — build/destroy alert dynamically to avoid CLS
const form = document.getElementById("contact-form");

if (form) {
  const submitBtn = form.querySelector('button[type="submit"]');

  // Create alert DOM only when needed
  const buildAlert = (msg, isError = false) => {
    const wrap = document.createElement("div");
    wrap.className = "alert";
    wrap.setAttribute("role", "alert");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-atomic", "true");

    const box = document.createElement("div");
    box.className = "alert-box";
    const p = document.createElement("p");
    p.textContent = msg;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Close");
    btn.textContent = "Close";

    box.append(p, btn);
    wrap.append(box);

    if (isError) wrap.classList.add("error");

    // close on button / overlay click / Escape
    const hide = () => {
      wrap.classList.remove("show", "error");
      // remove after fade-out
      const remove = () => {
        wrap.removeEventListener("transitionend", remove);
        wrap.remove();
      };
      wrap.addEventListener("transitionend", remove);
    };

    btn.addEventListener("click", hide);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) hide();
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && hide(), {
      once: true,
    });

    document.body.appendChild(wrap);
    // force next frame to let CSS transitions apply
    requestAnimationFrame(() => wrap.classList.add("show"));

    return { hide };
  };

  const showAlert = (msg, isError = false) => buildAlert(msg, isError);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      showAlert("Please fill out all fields.", true);
      return;
    }

    fd.append("access_key", "d3616c5e-24f5-4180-b6de-effda302a494"); // set your real key

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

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
