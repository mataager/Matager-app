//

// Promo codes database
const promoCodes = {
  WELCOME20: { type: "percentage", value: 20, valid: true },
  SAVE50: { type: "fixed", value: 50, valid: true },
  SUMMER25: { type: "percentage", value: 25, valid: true },
  FIRSTYEAR: { type: "percentage", value: 30, valid: true },
};

let appliedPromo = null;
let currentPlanPrice = 0;
let discountAmount = 0;

// Plan selection change handler
document.getElementById("plan-type").addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const planId = selectedOption.value;
  const planPrice = parseFloat(selectedOption.dataset.price) || 0;
  const period = selectedOption.dataset.period || "month";
  const planName = selectedOption.text.split(" - ")[0];

  currentPlanPrice = planPrice;

  // Update UI
  document.getElementById("selected-plan").textContent = planName;
  document.getElementById("plan-price").textContent = formatPrice(
    planPrice,
    period
  );
  document.getElementById("billing-period").textContent =
    period === "month" ? "Monthly" : "Yearly";

  // Show/hide plan details

  // Recalculate total
  calculateTotal();
});

// Apply promo code
document.getElementById("apply-promo").addEventListener("click", function () {
  const promoCode = document
    .getElementById("promo-code")
    .value.trim()
    .toUpperCase();
  const messageElement = document.getElementById("promo-message");

  if (!promoCode) {
    messageElement.textContent = "Please enter a promo code";
    messageElement.className = "promo-message error";
    return;
  }

  if (promoCodes[promoCode] && promoCodes[promoCode].valid) {
    appliedPromo = promoCodes[promoCode];
    messageElement.textContent = `Promo code applied successfully! ${
      appliedPromo.type === "percentage"
        ? appliedPromo.value + "%"
        : "$" + appliedPromo.value
    } discount`;
    messageElement.className = "promo-message success";
    calculateTotal();
  } else {
    messageElement.textContent = "Invalid or expired promo code";
    messageElement.className = "promo-message error";
    appliedPromo = null;
    calculateTotal();
  }
});

// Payment method change handler
document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    // Hide all payment details
    document.querySelectorAll(".payment-details").forEach((detail) => {
      detail.style.display = "none";
    });

    // Show selected payment method details
    if (this.value === "credit-card") {
      document.getElementById("credit-card-details").style.display = "flex";
    } else if (this.value === "mobile-wallet") {
      document.getElementById("mobile-wallet-details").style.display = "block";
    }
  });
});

// Calculate total price
function calculateTotal() {
  const planPrice = currentPlanPrice;

  // Apply discount
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = planPrice * (appliedPromo.value / 100);
    } else {
      discount = appliedPromo.value;
    }

    // Ensure discount doesn't exceed plan price
    discount = Math.min(discount, planPrice);
  }

  discountAmount = discount;
  const total = planPrice - discount;

  // Update UI
  document.getElementById("discount-amount").textContent =
    formatPrice(discount);
  document.getElementById("total-price").textContent = formatPrice(total);

  // Update submit button text
  const submitBtn = document.getElementById("submit-btn");
  if (total > 0) {
    submitBtn.innerHTML = `Pay ${formatPrice(
      total
    )} <i class="fa-solid fa-lock"></i>`;
  } else {
    submitBtn.innerHTML =
      'Sign Up Free <i class="fa-solid fa-arrow-right-to-bracket"></i>';
  }
}

// Format price display
function formatPrice(amount, period = "") {
  if (amount === 0) return "Free";

  if (period === "year") {
    return `${amount.toFixed(0)}/year`;
  } else if (period === "month") {
    return `${amount.toFixed(2)}/month`;
  }

  return `${amount.toFixed(2)} EGP`;
}

// === 1. COLLECT FORM DATA ===
function collectFormData(isSignupMode = false) {
  const data = {
    email: document.getElementById("email").value.trim().toLowerCase(),
    password: document.getElementById("password").value,
    rememberMe: document.getElementById("remember").checked,
  };

  if (isSignupMode) {
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();

    Object.assign(data, {
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      phone: document.getElementById("phone").value.trim(),
      businessPhone:
        document.getElementById("business-phone").value.trim() || null,
      businessName: document.getElementById("business-name").value.trim(),
      businessCategory: document.getElementById("business-category").value,
      country: document.getElementById("country").value.trim(),
      city: document.getElementById("city").value.trim(),
      district: document.getElementById("district").value.trim(),
      plan: document.getElementById("plan-type").value,
      planName: document
        .getElementById("plan-type")
        .options[document.getElementById("plan-type").selectedIndex].text.split(
          " - "
        )[0],
      price: currentPlanPrice,
      total: currentPlanPrice - discountAmount,
      paymentMethod: document.querySelector(
        'input[name="payment-method"]:checked'
      ).value,
      promoCode: appliedPromo
        ? document.getElementById("promo-code").value.trim().toUpperCase()
        : null,
      termsAccepted: document.getElementById("terms").checked,
      marketingEmails: document.getElementById("marketing").checked,
      autoRenew: document.getElementById("auto-renew").checked,
      cardDetails: {
        number: document.getElementById("card-number").value.replace(/\s/g, ""),
        expiry: document.getElementById("card-expiry").value,
        cvc: document.getElementById("card-cvc").value,
        name: document.getElementById("card-name").value.trim(),
      },
    });
  }

  return data;
}

// === 2. CREATE FIREBASE AUTH ACCOUNT FUNCTION ===
async function createFirebaseAuthAccount(email, password, displayName) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Update user's display name
    await user.updateProfile({
      displayName: displayName,
    });

    // Get user token
    const token = await user.getIdToken();

    return {
      success: true,
      user: user,
      token: token,
      uid: user.uid,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
}

// === 3. SAVE CLIENT DATA TO REALTIME DATABASE ===
async function saveClientDataToDatabase(uid, token, formData) {
  try {
    // Calculate expiry date
    function calculateExpiryDate(planType) {
      const now = new Date();
      let expiry = new Date();

      switch (planType) {
        case "free":
          expiry.setDate(now.getDate() + 14); // 14-day trial
          break;
        case "TheOne":
        case "FastCart":
        case "FastCartplus":
        case "Matagerfull":
        case "Matagerfullplus":
          expiry.setMonth(now.getMonth() + 1); // 1 month for paid plans
          break;
        default:
          expiry.setMonth(now.getMonth() + 1);
      }
      return expiry.toISOString();
    }

    const startedAt = new Date().toISOString();
    const expDate = calculateExpiryDate(formData.plan);

    // Prepare client data for database
    const clientData = {
      userId: uid,
      token: token,
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      // storeId: formData.uid,
      businessName: formData.businessName,
      role: "client",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Save to /clients/{uid}
    await database.ref(`/clients/${uid}`).set(clientData);

    // Create store structure
    const storeData = {
      Matager: {
        Amount: 0,
        count: 0,
        cut: 0,
      },
    };
    await database.ref(`/Stores/${uid}`).set(storeData);

    // Add store-info
    const storeInfo = {
      mainInfo: {
        defaultDomain: `www.matager/dashboard/${uid}.com`,
        Domain: "",
        businessEmail: "",
        "store-name": formData.businessName,
        plan: formData.planName,
        businessPhone: formData.businessPhone,
        businessCategory: formData.businessCategory,
      },
      structureInfo: {
        Lightning: `lightmode`,
        theme: `-3847nf783`,
      },
      adminInfo: {
        "phone-number": formData.phone,
        name: formData.fullName,
        Email: formData.email,
        marketingOptIn: formData.marketingEmails,
        token: token,
        profilePic: "",
      },
      locationInfo: {
        country: formData.country,
        city: formData.city,
        district: formData.district,
      },
    };
    const billingInfo = {
      startedAt: startedAt,
      expDate: expDate,
      subType: formData.planName,
      planId: formData.plan,
      paymentMethod: formData.paymentMethod,
      autoRenew: formData.autoRenew,
      status: "active",
      price: formData.price,
      total: formData.total,
      discount: discountAmount,
      promoCode: formData.promoCode,
    };

    await database.ref(`/Stores/${uid}/store-info`).set(storeInfo);
    await database
      .ref(`/Stores/${uid}/store-info/billingInfo`)
      .push(billingInfo);

    return {
      success: true,
      clientData: clientData,
      startedAt: startedAt,
      expDate: expDate,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
}

// === 4. SEND DATA TO BACKEND API ===
async function sendDataToBackendAPI(
  userId,
  token,
  name,
  startedAt,
  expDate,
  subType,
  email
) {
  // try {
  //     const apiData = {
  //         userId: userId,
  //         token: token,
  //         name: name,
  //         startedAt: "2026-05-20",
  //         expDate: "2027-06-20",
  //         subType: "low",
  //         role: "user",
  //         email: "fromfirebase@gmail.com"
  //     };
  //     console.log(apiData);
  //     const response = await fetch('https://mataager-services-production.up.railway.app/api/v1/auth/create-token', {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'Accept': 'application/json'
  //         },
  //         body: JSON.stringify(apiData)
  //     });
  //     if (!response.ok) {
  //         throw new Error(`Backend API error: ${response.status}`);
  //     }
  //     const result = await response.json();
  //     return {
  //         success: true,
  //         data: result
  //     };
  //     console.log("data pushed:", apiData)
  //     console.log("succeed", success)
  // } catch (error) {
  //     console.warn('Backend API call failed:', error);
  //     return {
  //         success: false,
  //         error: error
  //     };
  // }
}

async function toggleLoading(
  containerId,
  { show = true, percent = 0, message = "", isError = false } = {}
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let overlay = document.getElementById("loader-overlay");

  if (show) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loader-overlay";
      overlay.className = "advanced-loader-overlay";
      overlay.innerHTML = `
                <div class="spinner-box">
                    <div class="spinner-border"></div>
                    <span class="percentage-display" id="perc-count">0%</span>
                </div>
                <div class="loader-text" id="loader-status"></div>
            `;
      container.appendChild(overlay);
      container.style.pointerEvents = "none";
      container.dataset.loadStartTime = Date.now();
    }

    // Handle Error State
    if (isError) {
      overlay.classList.add("error-state");
      const statusEl = document.getElementById("loader-status");
      const percEl = document.getElementById("perc-count");
      if (statusEl) statusEl.textContent = `Error: ${message}`;
      if (percEl) percEl.textContent = "!"; // Change % to an exclamation mark

      // Allow user to click again to fix the error
      container.style.pointerEvents = "all";

      // Auto-remove error after 4 seconds so they can try again
      setTimeout(() => toggleLoading(containerId, { show: false }), 4000);
      return;
    }

    // Normal Update Logic
    const statusEl = document.getElementById("loader-status");
    if (statusEl) statusEl.textContent = message;

    const percEl = document.getElementById("perc-count");
    if (percEl) {
      let current = parseInt(percEl.textContent) || 0;
      let target = Math.min(percent, 99);
      let counter = setInterval(() => {
        if (current >= target) clearInterval(counter);
        else {
          current++;
          percEl.textContent = `${current}%`;
        }
      }, 10);
    }
  } else {
    if (!overlay) return;
    const startTime = parseInt(container.dataset.loadStartTime);
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 5000 - elapsed);

    setTimeout(() => {
      const percEl = document.getElementById("perc-count");
      if (percEl && !overlay.classList.contains("error-state"))
        percEl.textContent = "100%";

      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        container.style.pointerEvents = "all";
      }, 300);
    }, remainingTime);
  }
}

async function startSignupFlow() {
  const card = "login-container";

  try {
    // --- STEP 1: INITIALIZE & COLLECT ---
    toggleLoading(card, {
      show: true,
      percent: 5,
      message: "Collecting your information...",
    });

    const formData = collectFormData(true);

    // --- STEP 2: VALIDATION (From Old Logic) ---
    const validationErrors = validateSignupData(formData);
    if (validationErrors.length > 0) {
      // Throwing an error here jumps straight to the 'catch' block below
      throw new Error(validationErrors[0]);
    }

    // --- STEP 3: PAYMENT ---
    toggleLoading(card, {
      show: true,
      percent: 25,
      message: "Processing payment via Kashier...",
    });
    // Simulating payment delay
    await new Promise((r) => setTimeout(r, 1500));

    // --- STEP 4: FIREBASE AUTH ---
    toggleLoading(card, {
      show: true,
      percent: 50,
      message: "Creating your secure account...",
    });

    const authResult = await createFirebaseAuthAccount(
      formData.email,
      formData.password,
      formData.fullName
    );
    if (!authResult.success) {
      // This preserves your detailed Firebase error codes (weak-password, etc.)
      throw authResult.error;
    }

    // --- STEP 5: DATABASE & DATES ---
    toggleLoading(card, {
      show: true,
      percent: 75,
      message: "Setting up your store dashboard...",
    });

    const dbResult = await saveClientDataToDatabase(
      authResult.uid,
      authResult.token,
      formData
    );
    if (!dbResult.success) throw dbResult.error;

    // --- STEP 6: BACKEND SYNC ---
    toggleLoading(card, {
      show: true,
      percent: 90,
      message: "Synchronizing services...",
    });

    await sendDataToBackendAPI(
      authResult.uid,
      authResult.token,
      formData.fullName,
      dbResult.startedAt, // Passed as "YYYY-MM-DD" from dbResult
      dbResult.expDate, // Passed as "YYYY-MM-DD" from dbResult
      formData.plan,
      formData.email
    );

    // --- STEP 7: SUCCESS & REDIRECT (From Old Logic) ---
    toggleLoading(card, { show: false });

    document.getElementById("login-form").style.display = "none";
    document.getElementById("success-message").style.display = "block";

    console.log("Account created successfully:", {
      uid: authResult.uid,
      plan: formData.planName,
    });

    // Automatic Redirect after 3 seconds
    setTimeout(() => {
      const dashboardUrl = `https://www.matager/dashboard/${authResult.uid}`;

      // '_blank' opens in a new tab
      window.open(dashboardUrl, "_blank");

      // Optional: Keep the current tab on the success page or reload it
      // window.location.reload();
    }, 3000);
  } catch (error) {
    // --- STEP 8: ADVANCED ERROR MAPPING (From Old Logic) ---
    let friendlyMessage = "";

    // Map Firebase technical codes to human-friendly messages
    switch (error.code) {
      case "auth/email-already-in-use":
        friendlyMessage = "This email is already registered.";
        break;
      case "auth/weak-password":
        friendlyMessage = "Password is too weak. Use at least 6 characters.";
        break;
      case "auth/network-request-failed":
        friendlyMessage = "Network error. Please check your connection.";
        break;
      case "PERMISSION_DENIED":
        friendlyMessage = "Database error. Please contact support.";
        break;
      default:
        // Use the error message directly if it's a custom validation error
        friendlyMessage = error.message || "An unexpected error occurred.";
    }

    // Show the red error state in the loading UI
    toggleLoading(card, {
      show: true,
      isError: true,
      message: friendlyMessage,
    });

    console.error("Signup Flow Error:", error);
  }
}

function validateSignupData(formData) {
  const errors = [];

  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!formData.password || formData.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (!formData.firstName || formData.firstName.length < 2) {
    errors.push("First name is required");
  }

  if (!formData.lastName || formData.lastName.length < 2) {
    errors.push("Last name is required");
  }

  if (!formData.phone) {
    errors.push("Phone number is required");
  }

  if (!formData.businessName) {
    errors.push("Business name is required");
  }

  if (!formData.businessCategory) {
    errors.push("Business category is required");
  }

  if (!formData.country || !formData.city || !formData.district) {
    errors.push("Please fill in all location fields");
  }

  if (!formData.plan) {
    errors.push("Please select a plan");
  }

  if (!formData.termsAccepted) {
    errors.push("You must agree to the Terms of Service and Privacy Policy");
  }

  // Validate payment details if credit card is selected and total > 0
  if (formData.paymentMethod === "credit-card" && formData.total > 0) {
    if (
      !formData.cardDetails.number ||
      formData.cardDetails.number.length < 16
    ) {
      errors.push("Please enter a valid card number");
    }

    if (
      !formData.cardDetails.expiry ||
      !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardDetails.expiry)
    ) {
      errors.push("Please enter a valid expiry date (MM/YY)");
    }

    if (
      !formData.cardDetails.cvc ||
      formData.cardDetails.cvc.length < 3 ||
      formData.cardDetails.cvc.length > 4
    ) {
      errors.push("Please enter a valid CVC code (3-4 digits)");
    }

    if (!formData.cardDetails.name || formData.cardDetails.name.length < 2) {
      errors.push("Please enter the name on card");
    }
  }

  return errors;
}

function validateLoginData(formData) {
  const errors = [];

  if (!formData.email) {
    errors.push("Email is required");
  }

  if (!formData.password) {
    errors.push("Password is required");
  }

  return errors;
}

// === 7. MAIN SIGNUP HANDLER ===
// async function handleSignup() {
//     const submitBtn = document.getElementById('submit-btn');

//     // 1. Show loading spinner in the middle
//     // showLoading(submitBtn, true, 'Creating Account...');
//     toggleLoading('login-container', show = true, message = 'Creating Account...');

//     // 2. Collect data
//     const formData = collectFormData(true);

//     // 3. Validate data
//     const validationErrors = validateSignupData(formData);
//     if (validationErrors.length > 0) {
//         alert(validationErrors[0]);
//         return;
//     }

//     try {
//         // 4. Create Firebase Auth account
//         const authResult = await createFirebaseAuthAccount(formData.email, formData.password, formData.fullName);
//         if (!authResult.success) {
//             throw authResult.error;
//         }

//         // 5. Save client data to Realtime Database
//         const dbResult = await saveClientDataToDatabase(
//             authResult.uid,
//             authResult.token,
//             formData
//         );
//         if (!dbResult.success) {
//             throw dbResult.error;
//         }

//         // 6. Send data to backend API
//         const apiResult = await sendDataToBackendAPI(
//             authResult.uid,
//             authResult.token,
//             formData.fullName,
//             dbResult.startedAt,
//             dbResult.expDate,
//             formData.planName,
//             formData.email
//         );

//         // 7. Show success message
//         document.getElementById('success-message').style.display = 'block';
//         document.getElementById('login-form').style.display = 'none';

//         console.log('Account created successfully:', {
//             uid: authResult.uid,
//             email: formData.email,
//             name: formData.fullName,
//             plan: formData.planName
//         });

//         // 8. Redirect to dashboard after 3 seconds
//         setTimeout(() => {
//             window.location.href = `https://www.matager/dashboard/${authResult.uid}`;
//         }, 3000);

//     } catch (error) {
//         console.error('Signup error:', error);

//         let errorMessage = 'Account creation failed. ';

//         switch (error.code) {
//             case 'auth/email-already-in-use':
//                 errorMessage = 'This email is already registered.';
//                 break;
//             case 'auth/invalid-email':
//                 errorMessage = 'Invalid email address.';
//                 break;
//             case 'auth/operation-not-allowed':
//                 errorMessage = 'Email/password accounts are not enabled.';
//                 break;
//             case 'auth/weak-password':
//                 errorMessage = 'Password is too weak.';
//                 break;
//             case 'auth/network-request-failed':
//                 errorMessage = 'Network error. Please check your connection.';
//                 break;
//             case 'PERMISSION_DENIED':
//                 errorMessage = 'Database permission denied. Please check Firebase Security Rules.';
//                 break;
//             default:
//                 errorMessage = error.message || 'Unknown error occurred.';
//         }

//         alert(errorMessage);
//         toggleLoading('login-container', show = false, message = 'Creating Account...');
//     }
// }

// === 8. MAIN LOGIN HANDLER ===
async function handleLogin() {
  const submitBtn = document.getElementById("submit-btn");

  // 1. Collect data
  const formData = collectFormData(false);

  // 2. Validate data
  const validationErrors = validateLoginData(formData);
  if (validationErrors.length > 0) {
    alert(validationErrors[0]);
    return;
  }

  // 3. Show loading spinner in the middle
  toggleLoading("login-container", (show = true), (message = "Signing in..."));

  try {
    // 4. Sign in with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // 5. Get user data from database
    const userSnapshot = await database
      .ref(`/users/clients/${user.uid}`)
      .once("value");
    const userData = userSnapshot.val();

    if (!userData) {
      throw new Error("User data not found in database");
    }

    // 6. Check user role
    if (userData.role !== "client") {
      throw new Error("Access denied. This is not a client account.");
    }

    // 7. Update last login time
    await database.ref(`/users/clients/${user.uid}`).update({
      lastLogin: new Date().toISOString(),
    });

    // 8. Get new token for backend API
    const token = await user.getIdToken();

    // 9. Send updated token to backend API (optional, don't block login if it fails)
    sendDataToBackendAPI(
      user.uid,
      token,
      userData.name,
      userData.startedAt,
      userData.expDate,
      userData.subType,
      user.email
    ).catch((apiError) => {
      console.warn("Backend API update failed:", apiError);
    });

    // 10. Redirect to dashboard
    window.location.href = `https://www.matager/dashboard/${user.uid}`;
  } catch (error) {
    console.error("Login error:", error);

    let errorMessage = "Login failed. ";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled.";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/too-many-requests":
        errorMessage =
          "Too many failed login attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your connection.";
        break;
      default:
        errorMessage = error.message || "Unknown error occurred.";
    }

    alert(errorMessage);
    toggleLoading("login-container", (show = false), (message = ""));
  }
}

// === 9. EVENT LISTENERS ===
document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const isSignupMode =
      document.getElementById("full-name-field").style.display !== "none";

    if (isSignupMode) {
      await handleSignup();
    } else {
      await handleLogin();
    }
  });

// Existing UI functions (keep your original code)
document.getElementById("plan-type").addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const planPrice = parseFloat(selectedOption.dataset.price) || 0;
  const period = selectedOption.dataset.period || "month";
  const planName = selectedOption.text.split(" - ")[0];

  currentPlanPrice = planPrice;

  document.getElementById("selected-plan").textContent = planName;
  document.getElementById("plan-price").textContent = formatPrice(
    planPrice,
    period
  );
  document.getElementById("billing-period").textContent =
    period === "month" ? "Monthly" : "Yearly";

  calculateTotal();
});

document.getElementById("apply-promo").addEventListener("click", function () {
  const promoCode = document
    .getElementById("promo-code")
    .value.trim()
    .toUpperCase();
  const messageElement = document.getElementById("promo-message");

  if (!promoCode) {
    messageElement.textContent = "Please enter a promo code";
    messageElement.className = "promo-message error";
    return;
  }

  if (promoCodes[promoCode] && promoCodes[promoCode].valid) {
    appliedPromo = promoCodes[promoCode];
    messageElement.textContent = `Promo code applied successfully! ${
      appliedPromo.type === "percentage"
        ? appliedPromo.value + "%"
        : "$" + appliedPromo.value
    } discount`;
    messageElement.className = "promo-message success";
    calculateTotal();
  } else {
    messageElement.textContent = "Invalid or expired promo code";
    messageElement.className = "promo-message error";
    appliedPromo = null;
    calculateTotal();
  }
});

document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    document.querySelectorAll(".payment-details").forEach((detail) => {
      detail.style.display = "none";
    });

    if (this.value === "credit-card") {
      document.getElementById("credit-card-details").style.display = "flex";
    } else if (this.value === "mobile-wallet") {
      document.getElementById("mobile-wallet-details").style.display = "block";
    }
  });
});

function calculateTotal() {
  const planPrice = currentPlanPrice;
  let discount = 0;

  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = planPrice * (appliedPromo.value / 100);
    } else {
      discount = appliedPromo.value;
    }
    discount = Math.min(discount, planPrice);
  }

  discountAmount = discount;
  const total = planPrice - discount;

  document.getElementById("discount-amount").textContent =
    formatPrice(discount);
  document.getElementById("total-price").textContent = formatPrice(total);

  const submitBtn = document.getElementById("submit-btn");
  if (total > 0) {
    submitBtn.innerHTML = `Pay ${formatPrice(
      total
    )} <i class="fa-solid fa-lock"></i>`;
  } else {
    submitBtn.innerHTML =
      'Sign Up Free <i class="fa-solid fa-arrow-right-to-bracket"></i>';
  }
}

function formatPrice(amount, period = "") {
  if (amount === 0) return "Free";
  if (period === "year") return `${amount.toFixed(0)}/year`;
  if (period === "month") return `${amount.toFixed(2)}/month`;
  return `${amount.toFixed(2)} EGP`;
}

// Card input formatting
document.getElementById("card-number").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/(.{4})/g, "$1 ").trim();
  e.target.value = value.substring(0, 19);
});

document.getElementById("card-expiry").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  e.target.value = value.substring(0, 5);
});

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("credit-card-details").style.display = "flex";

  const switchLink = document.getElementById("switch-to-signup");
  if (switchLink) {
    switchLink.addEventListener("click", function (e) {
      e.preventDefault();
      // Your logic to switch between login/signup views
    });
  }
});

//
// Helper function to get all form values
function getAllFormValues() {
  const form = document.getElementById("login-form");
  const formData = new FormData(form);
  const values = {};

  formData.forEach((value, key) => {
    if (values[key]) {
      if (Array.isArray(values[key])) {
        values[key].push(value);
      } else {
        values[key] = [values[key], value];
      }
    } else {
      values[key] = value;
    }
  });

  return values;
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone number (basic international format)
function isValidPhone(phone) {
  const phoneRegex = /^[\+\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 8;
}

// Helper function to format card number for display
function formatCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : "";
}

// Helper function to mask sensitive data for logging
function maskSensitiveData(data) {
  const masked = { ...data };

  if (masked.password) {
    masked.password = "********";
  }

  if (masked.cardDetails) {
    masked.cardDetails = {
      ...masked.cardDetails,
      number: masked.cardDetails.number
        ? "**** **** **** " + masked.cardDetails.number.slice(-4)
        : "",
      cvc: masked.cardDetails.cvc ? "***" : "",
    };
  }

  return masked;
}
// Credit card input formatting
document.getElementById("card-number").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/(.{4})/g, "$1 ").trim();
  e.target.value = value.substring(0, 19);
});

document.getElementById("card-expiry").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  e.target.value = value.substring(0, 5);
});

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Show credit card details by default
  document.getElementById("credit-card-details").style.display = "flex";

  // Set up switch between login/signup modes
  const switchLink = document.getElementById("switch-to-signup");
  if (switchLink) {
    switchLink.addEventListener("click", function (e) {
      e.preventDefault();
      // This would be your logic to switch between login and signup views
      // alert('Switch to signup mode - this would show all additional fields');
    });
  }
});

// end1

//2

// Scroll animations
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section");
  const scrollDots = document.querySelectorAll(".scroll-dot");
  // const navLinks = document.querySelectorAll('.nav-link');

  // Set first section as active initially
  let currentSection = 0;

  // Function to update active section
  function updateActiveSection() {
    // Calculate which section is currently in view
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        // Remove active class from all sections
        sections.forEach((s) => {
          s.classList.remove("active", "previous");
        });

        // Add previous class to previous section if exists
        if (index > 0) {
          sections[index - 1].classList.add("previous");
        }

        // Add active class to current section
        section.classList.add("active");
        currentSection = index;

        // Update scroll dots
        scrollDots.forEach((dot) => dot.classList.remove("active"));
        scrollDots[index].classList.add("active");

        // // Update nav links
        // navLinks.forEach(link => link.classList.remove('active'));
        // navLinks[index].classList.add('active');
      }
    });
  }

  // Scroll to section when clicking on nav links or dots
  function scrollToSection(index) {
    sections[index].scrollIntoView({ behavior: "smooth" });
    currentSection = index;
  }

  // Add click events to scroll dots
  scrollDots.forEach((dot, index) => {
    dot.addEventListener("click", () => scrollToSection(index));
  });

  // Add click events to nav links
  // navLinks.forEach((link, index) => {
  //     link.addEventListener('click', (e) => {
  //         e.preventDefault();
  //         scrollToSection(index);
  //     });
  // });

  // Update on scroll
  window.addEventListener("scroll", updateActiveSection);

  // Initialize
  updateActiveSection();

  // Form submission
  const ctaForm = document.querySelector(".cta-form");
  const ctaInput = document.querySelector(".cta-input");
  const ctaButton = ctaForm.querySelector(".btn-primary");

  ctaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = ctaInput.value.trim();

    if (email && validateEmail(email)) {
      ctaButton.textContent = "Submitting...";
      ctaButton.disabled = true;

      // Simulate API call
      setTimeout(() => {
        ctaButton.textContent = "Thank You!";
        ctaInput.value = "";

        setTimeout(() => {
          ctaButton.textContent = "Get Started Free";
          ctaButton.disabled = false;
        }, 3000);
      }, 1500);
    }
  });

  // Email validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});

//3

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
});

// Observe plan cards
document.querySelectorAll(".plan-card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(20px)";
  card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  observer.observe(card);
});
