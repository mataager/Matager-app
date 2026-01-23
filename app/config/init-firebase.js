const firebaseConfig = {
  apiKey: "AIzaSyDss53pHibCpqo87_1bhoUHkf8Idnj-Fig",
  authDomain: "matager-f1f00.firebaseapp.com",
  databaseURL: "https://matager-f1f00-default-rtdb.firebaseio.com",
  projectId: "matager-f1f00",
  storageBucket: "matager-f1f00.appspot.com",
  messagingSenderId: "922824110897",
  appId: "1:922824110897:web:b7978665d22e2d652e7610",
  measurementId: "G-FWS29Z8GMT",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

//

function fillTestData() {
  // 1. Basic Info
  document.getElementById("email").value = "test.user@example.com";
  document.getElementById("password").value = "SecurePass123!";

  // 2. Name & Business
  document.getElementById("first-name").value = "Omar";
  document.getElementById("last-name").value = "Mohamed";
  document.getElementById("business-name").value = "The Tech Emporium";
  document.getElementById("business-category").value = "electronics";

  // 3. Contact & Location
  document.getElementById("phone").value = "01010773587";
  document.getElementById("business-phone").value = "01010773253";
  document.getElementById("country").value = "Egypt";
  document.getElementById("city").value = "Cairo";
  document.getElementById("district").value = "Maadi";

  // 4. Plan & Promo
  const planSelect = document.getElementById("plan-type");
  planSelect.value = "FastCart";
  // Trigger change event so your summary/UI updates
  planSelect.dispatchEvent(new Event("change"));

  document.getElementById("promo-code").value = "WELCOME2026";

  // 5. Payment Details
  document.getElementById("card-number").value = "4242 4242 4242 4242";
  document.getElementById("card-expiry").value = "12/28";
  document.getElementById("card-cvc").value = "123";
  document.getElementById("card-name").value = "Omar Mohamed";

  // 6. Checkboxes
  document.getElementById("terms").checked = true;
  document.getElementById("marketing").checked = true;
  document.getElementById("auto-renew").checked = true;

  console.log("✅ Form filled with test data!");
}

