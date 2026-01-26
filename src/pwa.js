// let deferredPrompt; // Using any because the BeforeInstallPromptEvent type is non-standard
// const installBtn = document.querySelector("#installBtn");

// // 1. Listen for the browser's install prompt
// window.addEventListener("beforeinstallprompt", (e) => {
//   // Prevent the mini-infobar from appearing on mobile
//   e.preventDefault();
//   // Stash the event so it can be triggered later.
//   deferredPrompt = e;
//   // Update UI notify the user they can install the PWA
//   installBtn.style.display = "block";
// });

// // 2. Handle the click on your custom install button
// installBtn.addEventListener("click", async () => {
//   if (!deferredPrompt) return;

//   // Show the install prompt
//   deferredPrompt.prompt();

//   // Wait for the user to respond to the prompt
//   const { outcome } = await deferredPrompt.userChoice;
//   console.log(`User response to the install prompt: ${outcome}`);

//   // We've used the prompt, and can't use it again; throw it away
//   deferredPrompt = null;
//   installBtn.style.display = "none";
// });

// 3. Hide the button if the app is successfully installed
// window.addEventListener("appinstalled", () => {
//   console.log("PWA was installed");
//   installBtn.style.display = "none";
// });
const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  } else {
    console.warn("Notification permission denied.");
  }
};

// Attach this to your "New" button or a specific "Enable Reminders" button
requestPermission();
async function registerPeriodicSync() {
  const registration = await navigator.serviceWorker.ready;

  if ("periodicSync" in registration) {
    try {
      await registration.periodicSync.register("daily-reminder", {
        minInterval: 24 * 60 * 60 * 1000,
      });
      console.log("Periodic sync registered!");
    } catch (error) {
      console.error("Periodic sync could not be registered:", error);
    }
  }
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW Registered!", reg);
        registerPeriodicSync();
      })
      .catch((err) => console.log("SW Registration failed:", err));
  });
}
