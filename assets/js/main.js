// Crown of Glory Glasgow — light vanilla JS for interactivity.
// No framework, no dependencies.

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-primary");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    // Close mobile nav when a link is chosen
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Generic client-side form validation ---------- */
  // Applies to any <form data-validate> — used by the I'm New and Contact pages.
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var value = input.value.trim();
        var fieldValid = value.length > 0;

        if (input.type === "email" && value) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        if (field) {
          field.classList.toggle("has-error", !fieldValid);
        }
        if (!fieldValid) valid = false;
      });

      if (status) {
        status.classList.remove("form-status--success", "form-status--error");
        if (valid) {
          status.textContent = "Thank you — we've received your message and will be in touch soon.";
          status.classList.add("form-status--success", "is-visible");
          form.reset();
        } else {
          status.textContent = "Please check the highlighted fields and try again.";
          status.classList.add("form-status--error", "is-visible");
        }
      }

      // NOTE: This is a static-site placeholder handler. Connect a real
      // backend/CMS endpoint here (see README.md) to actually send data.
    });
  });

  /* ---------- Events page: calendar / list view toggle (static UI) ---------- */
  var viewToggle = document.querySelector("[data-view-toggle]");
  if (viewToggle) {
    var buttons = viewToggle.querySelectorAll("button");
    var listView = document.querySelector("[data-view='list']");
    var calendarView = document.querySelector("[data-view='calendar']");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        var target = btn.getAttribute("data-show");
        if (listView) listView.hidden = target !== "list";
        if (calendarView) calendarView.hidden = target !== "calendar";
      });
    });
  }
})();
