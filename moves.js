//plans work

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const plansSection = document.querySelector(".plans-section");
  const comparisonSection = document.querySelector(".comparison-section");
  const planCards = document.querySelectorAll(".plan-card");
  const expandBtns = document.querySelectorAll(".expand-btn");

  // Variables
  let expandedCard = null;
  let isMobile = window.innerWidth <= 900;

  // 1. View Toggle Functionality
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;

      // Update active button
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Show/hide sections
      if (view === "plans") {
        plansSection.classList.remove("hidden");
        plansSection.classList.add("active");
        comparisonSection.classList.remove("active");
      } else {
        plansSection.classList.add("hidden");
        comparisonSection.classList.add("active");
        plansSection.classList.remove("active");
      }
    });
  });

  // 2. Plan Card Expand/Collapse (Mobile Only)
  function setupMobileCards() {
    planCards.forEach((card) => {
      const features = card.querySelector(".plan-features");

      // Reset all cards
      card.classList.remove("expanded");
      if (features) {
        features.style.maxHeight = null;
      }

      // Add click handler for mobile
      if (isMobile) {
        card.addEventListener("click", function (e) {
          // Don't trigger if clicking on button
          if (
            e.target.closest(".btn-plan") ||
            e.target.closest(".expand-btn")
          ) {
            return;
          }

          toggleCard(this);
        });
      }
    });

    // Expand button handlers
    expandBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const card = this.closest(".plan-card");
        toggleCard(card);
      });
    });
  }

  function toggleCard(card) {
    if (!isMobile) return;

    if (card === expandedCard) {
      // Collapse
      card.classList.remove("expanded");
      expandedCard = null;
    } else {
      // Collapse previously expanded card
      if (expandedCard) {
        expandedCard.classList.remove("expanded");
      }
      // Expand this card
      card.classList.add("expanded");
      expandedCard = card;

      // Scroll to expanded card
      setTimeout(() => {
        card.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }

  // 3. Plan Selection Functionality
  function selectPlan(planType) {
    console.log(`Selected plan: ${planType}`);
    // Here you would typically redirect to checkout or show a modal
    alert(`You selected the ${planType.toUpperCase()} plan!`);
  }

  // Add click handlers to upgrade buttons
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const card = this.closest(".plan-card");
      const planType = card.dataset.plan;
      selectPlan(planType);
    });
  });

  // 4. Handle Window Resize
  function handleResize() {
    const newIsMobile = window.innerWidth <= 900;

    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      setupMobileCards();

      // Reset expanded card on desktop
      if (!isMobile && expandedCard) {
        expandedCard.classList.remove("expanded");
        expandedCard = null;
      }
    }
  }

  // 5. Initialize
  setupMobileCards();
  window.addEventListener("resize", handleResize);

  // 6. Comparison table scroll hint
  const scrollHint = document.querySelector(".scroll-hint");
  const comparisonTable = document.querySelector(".comparison-table");

  if (comparisonTable && scrollHint) {
    comparisonTable.addEventListener("scroll", function () {
      if (this.scrollLeft > 10) {
        scrollHint.style.opacity = "0.5";
      } else {
        scrollHint.style.opacity = "1";
      }
    });
  }
});

//

//forms work

document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const getStartedBtn = document.getElementById("get-started-btn");
  const loginContainer = document.getElementById("login-container");
  const loginForm = document.getElementById("login-form");
  const formTitle = document.getElementById("form-title");
  const progressContainer = document.getElementById("progress-container");
  const progressFill = document.getElementById("progress-fill");
  const progressPercentage = document.getElementById("progress-percentage");
  const submitBtn = document.getElementById("submit-btn");
  const socialBtn = document.getElementById("social-btn");
  const signupLink = document.getElementById("signup-link");
  const switchToSignup = document.getElementById("switch-to-signup");
  // const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById("password");
  const successMessage = document.getElementById("success-message");
  const backToLoginBtn = document.getElementById("back-to-login");
  const loginOptions = document.getElementById("login-options");
  const divider = document.getElementById("divider");

  // Additional form fields
  const fullNameField = document.getElementById("full-name-field");
  const businessField = document.getElementById("business-field");
  const phoneField = document.getElementById("phone-field");
  const businessLocationField = document.getElementById(
    "business-location-field"
  );
  const planField = document.getElementById("plan-field");
  const paymentSummaryField = document.getElementById("payment-summary-field");
  const paymentMethodField = document.getElementById("payment-method-field");
  const promoField = document.getElementById("promo-field");
  const termsField = document.getElementById("terms-field");

  // State variables
  let isSignupMode = false;
  let currentStep = 0;
  const totalSteps = 8; // email, password, name, business, phone/terms

  // Toggle password visibility
  // togglePasswordBtn.addEventListener('click', function () {
  //     const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  //     passwordInput.setAttribute('type', type);
  //     this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
  // });

  // Get Started button click - expand form to signup
  getStartedBtn.addEventListener("click", expandToSignup);
  socialBtn.addEventListener("click", expandToSignup);
  switchToSignup.addEventListener("click", function (e) {
    e.preventDefault();
    expandToSignup();
  });

  // Function to expand form to signup mode
  function expandToSignup() {
    if (isSignupMode) return;

    isSignupMode = true;

    // Change UI to signup mode
    formTitle.textContent = "Create Your Account";
    submitBtn.innerHTML = 'Pay & Submit <i class="fas fa-user-plus"></i>';

    signupLink.innerHTML =
      'Already have an account? <a href="#" id="switch-to-login">Sign in</a>';

    // Add event listener for the new "Sign in" link
    document
      .getElementById("switch-to-login")
      .addEventListener("click", function (e) {
        e.preventDefault();
        collapseToLogin();
      });

    // Show additional fields
    fullNameField.classList.add("show");
    businessField.classList.add("show");
    phoneField.classList.add("show");
    planField.classList.add("show");
    businessLocationField.classList.add("show");
    paymentSummaryField.classList.add("show");
    paymentMethodField.classList.add("show");
    promoField.classList.add("show");
    termsField.classList.add("show");

    // Hide login-only elements
    loginOptions.style.display = "none";
    divider.style.display = "none";

    // Show progress indicator
    progressContainer.classList.add("show");

    // Add scrollable class to form
    loginForm.classList.add("expanded-form");

    // Update progress
    updateProgress();

    // Focus on first field
    document.getElementById("email").focus();
  }

  // Function to collapse form back to login mode
  function collapseToLogin() {
    isSignupMode = false;
    currentStep = 0;

    // Reset UI to login mode
    formTitle.textContent = "Sign in to continue";
    submitBtn.innerHTML =
      'Sign In <i class="fa-solid fa-arrow-right-to-bracket"></i>';
    signupLink.innerHTML =
      'Don\'t have an account? <a href="#" id="switch-to-signup">Sign up for free</a>';

    // Add event listener for the new "Sign up" link
    document
      .getElementById("switch-to-signup")
      .addEventListener("click", function (e) {
        e.preventDefault();
        expandToSignup();
      });

    // Hide additional fields
    fullNameField.classList.remove("show");
    businessField.classList.remove("show");
    phoneField.classList.remove("show");
    businessLocationField.classList.remove("show");
    planField.classList.remove("show");
    paymentSummaryField.classList.remove("show");
    paymentMethodField.classList.remove("show");
    promoField.classList.remove("show");
    termsField.classList.remove("show");

    // Show login-only elements
    loginOptions.style.display = "flex";
    divider.style.display = "flex";

    // Hide progress indicator
    progressContainer.classList.remove("show");

    // Remove scrollable class from form
    loginForm.classList.remove("expanded-form");

    // Reset progress bar
    progressFill.style.width = "0%";
    progressPercentage.textContent = "0%";
  }

  // Update progress indicator
  function updateProgress() {
    // Calculate progress based on filled fields
    const fields = [
      document.getElementById("email").value.trim(),
      document.getElementById("password").value.trim(),
      document.getElementById("first-name").value.trim(),
      document.getElementById("last-name").value.trim(),
      document.getElementById("business-name").value.trim(),
      document.getElementById("plan-type").value.trim(),
      document.getElementById("phone").value.trim(),
      document.getElementById("terms").checked,
    ];

    const filledFields = fields.filter(Boolean).length;
    const progress = Math.min((filledFields / totalSteps) * 100, 100);

    // Update progress bar
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;

    // Store current step for progress calculation
    currentStep = filledFields;
  }

  // Add input event listeners to update progress
  const allInputs = loginForm.querySelectorAll("input, select");
  allInputs.forEach((input) => {
    input.addEventListener("input", updateProgress);
    input.addEventListener("change", updateProgress);
  });

  // Form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (isSignupMode) {
      // Signup form submission
      const email = document.getElementById("email").value;
      const firstName = document.getElementById("first-name").value;

      // Show success message
      loginForm.style.display = "none";
      successMessage.classList.add("show");
      progressContainer.classList.remove("show");

      // Update success message with user's name
      document.querySelector(
        ".success-title"
      ).textContent = `Welcome, ${firstName}!`;
    } else {
      // Login form submission
      const email = document.getElementById("email").value;
      alert(
        `Logging in with email: ${email}\n(In a real app, this would authenticate with a backend)`
      );
      // Here you would typically send the data to your backend
    }
  });

  // Back to login button
  backToLoginBtn.addEventListener("click", function () {
    successMessage.classList.remove("show");
    loginForm.style.display = "flex";
    collapseToLogin();

    // Clear form
    loginForm.reset();
    updateProgress();
  });

  // Demo functionality for "View Demo" button
  document
    .querySelector(".btn-secondary")
    .addEventListener("click", function () {
      alert(
        "Demo mode activated! This would show a preview of the Matager dashboard."
      );
    });

  // Initial setup
  updateProgress();
});

//forms work end

// async function signInUser(email, password) {
//   console.log(email, password);
//   try {
//     const userCredential = await auth.signInWithEmailAndPassword(
//       email,
//       password
//     );
//     const user = userCredential.user;

//     // Get user role from database
//     const userData = await database.ref("clients/" + user.uid).once("value");
//     const role = userData.val().role;

//     if (role === "client") {
//       // Redirect to dashboard with user ID
//       //   window.location.href = `https://www.matager/dashboard/${user.uid}`;
//       window.location.href = `/app/client-dashboard/shopifytestui.html/${user.uid}`;
//     } else {
//       // Handle customer role differently
//       alert("Customer dashboard coming soon!");
//     }
//   } catch (error) {
//     console.error("Sign in error:", error);
//     alert(error.message);
//   }
// }

// Enhanced smooth scroll to any section
function scrollToSection(sectionId) {
  // If called without parameter, get from data attribute
  if (!sectionId) {
    console.error("No section specified!");
    return;
  }

  const targetSection = document.getElementById(sectionId);

  if (!targetSection) {
    console.error(`Section "${sectionId}" not found!`);
    return;
  }

  // Add highlight animation class
  targetSection.classList.add("section-highlight");

  // Calculate scroll position with offset
  const offset = 20; // Adjust this value based on your header height
  const elementPosition = targetSection.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  // Smooth scroll
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  // Remove highlight class after animation completes
  setTimeout(() => {
    targetSection.classList.remove("section-highlight");
  }, 2000);
}
//end Enhanced smooth scroll to any section

//faq smooth open
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  // First, set transition delays for staggered animations
  faqItems.forEach((item, index) => {
    const answer = item.querySelector(".faq-answer");
    answer.style.transitionDelay = `${index * 0.05}s`;
  });

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      // Close all other FAQs
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          closeFaq(otherItem);
        }
      });

      // Toggle current FAQ
      if (!isActive) {
        openFaq(item);
      } else {
        closeFaq(item);
      }
    });
  });

  // Helper functions for smooth animations
  function openFaq(faqItem) {
    const answer = faqItem.querySelector(".faq-answer");

    // First, temporarily remove transition to set initial height
    answer.style.transition = "none";
    answer.style.maxHeight = "0";
    answer.style.opacity = "0";

    // Force reflow
    answer.offsetHeight;

    // Calculate exact height needed
    const targetHeight = answer.scrollHeight;

    // Restore transition
    answer.style.transition = "";

    // Apply active class
    faqItem.classList.add("active");

    // Set to target height - CSS will animate this
    answer.style.maxHeight = targetHeight + "px";
    answer.style.opacity = "1";

    // Optional: Reset to auto after animation for dynamic content
    answer.addEventListener(
      "transitionend",
      function transitionEndHandler() {
        if (faqItem.classList.contains("active")) {
          answer.style.maxHeight = "none";
        }
        answer.removeEventListener("transitionend", transitionEndHandler);
      },
      { once: true }
    );
  }

  function closeFaq(faqItem) {
    const answer = faqItem.querySelector(".faq-answer");

    // If maxHeight is 'none', get the actual height first
    if (answer.style.maxHeight === "none") {
      answer.style.maxHeight = answer.scrollHeight + "px";
      // Force reflow
      answer.offsetHeight;
    }

    // Remove active class
    faqItem.classList.remove("active");

    // Start collapse animation
    answer.style.maxHeight = "0";
    answer.style.opacity = "0";

    // Clean up after animation
    answer.addEventListener(
      "transitionend",
      function transitionEndHandler() {
        if (!faqItem.classList.contains("active")) {
          answer.style.maxHeight = "";
          answer.style.opacity = "";
        }
        answer.removeEventListener("transitionend", transitionEndHandler);
      },
      { once: true }
    );
  }

  // Keyboard accessibility
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.setAttribute("tabindex", "0");
    question.setAttribute("role", "button");
    question.setAttribute("aria-expanded", "false");

    question.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });

    // Update aria-expanded on click
    item.addEventListener("click", function () {
      const isActive = this.classList.contains("active");
      question.setAttribute("aria-expanded", isActive.toString());
    });
  });
});
//end faq smooth open

//

//
