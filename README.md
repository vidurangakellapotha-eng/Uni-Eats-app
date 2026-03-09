<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SA0T3ZRB05qP6s-VN8suKMEsQBGhURz3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm.cmd install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm.cmd run dev`

### Connecting Firebase

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/), click "Add project", and follow the setup wizard.
2.  **Add a Web App**: Once the project is created, click the Web icon (</>) to create a new web app within the project.
3.  **Get Firebase Configuration**: Copy the `firebaseConfig` object provided by Firebase.
4.  **Configure Environment Variables**: Fill in the `VITE_FIREBASE_` variables in [.env.local](.env.local) with the values from your `firebaseConfig` object.
5.  **Initialize Firestore/Auth**: In the Firebase console, enable "Cloud Firestore" and/or "Authentication" if your app requires them.

Firebase is now initialized in [firebase.ts](firebase.ts) and ready for use in your application.
