import { Navigate, Route } from "react-router-dom";
import type { JSX } from "react";

import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from "@ionic/react";

import { IonReactRouter } from "@ionic/react-router";

import {
  homeOutline,
  storefrontOutline,
  schoolOutline,
  timeOutline,
  personOutline,
} from "ionicons/icons";

/* Pages */
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Training from "./pages/Training";
import History from "./pages/History";
import Profile from "./pages/Profile";

import Notifications from "./pages/Notification";
import BreedSelection from "./pages/BreedSelection";
import PetCategory from "./pages/PetCategory";
import BreedPets from "./pages/BreedPets";
import PetDetails from "./pages/PetDetails";
import AboutUs from "./pages/AboutUs";
import LikedPets from "./pages/LikedPets";
import MyBookings from "./pages/MyBookings";
import PaymentMethods from "./pages/PaymentMethods";
import NotificationSettings from "./pages/NotificationSettings";
import AppSettings from "./pages/AppSettings";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingReview from "./pages/BookingReview";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Cart from "./pages/Cart";

/* Context */
import { AuthProvider, useAuth } from "./context/AuthContext";

import { BookingsProvider } from "./context/BookingsContext";

import { CartProvider } from "./context/CartContext";

/* Ionic CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Dark mode */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme */
import "./global.css";
import "./App.css";

/* Splash screen images */
import bernerSennenhundPuppiesPosing1 from "./assets/images/pets/berner-sennenhund-puppies-posing-1.png";
import closeupShotOneGingerCatHuggingLickingOtherIsolatedWhiteWall1 from "./assets/images/pets/closeup-shot-one-ginger-cat-hugging-licking-other-isolated-white-wall-1.png";
import image12 from "./assets/images/pets/image-12.png";
import logo from "./assets/images/logo.png";
import vector from "./assets/images/splash/vector.svg";

setupIonicReact();

const App = () => {
  return (
    <AuthProvider>
      <BookingsProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </BookingsProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();

  /* =====================================
     AUTH LOADING
  ===================================== */

  if (authLoading) {
    return (
      <IonApp>
        <div className="flex min-h-screen items-center justify-center bg-white">
          <span className="text-2xl text-[#442808]">Loading...</span>
        </div>
      </IonApp>
    );
  }

  /* =====================================
     NOT LOGGED IN
  ===================================== */

  if (!isLoggedIn) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Sign Up */}
            <Route path="/signup" element={<SignUp />} />

            {/* Terms */}
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Privacy */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Anything else → Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  /* =====================================
     LOGGED IN
  ===================================== */

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          {/* =================================
              APP ROUTES
          ================================= */}

          <IonRouterOutlet>
            {/* ================================
                MAIN TABS
            ================================= */}

            {/* Home */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Shop */}
            <Route path="/shop" element={<Shop />} />

            {/* Training */}
            <Route path="/training" element={<Training />} />

            {/* History */}
            <Route path="/history" element={<History />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* ================================
                OTHER APP PAGES
            ================================= */}

            {/* Notifications */}
            <Route path="/notifications" element={<Notifications />} />

            {/* Breed Selection */}
            <Route path="/breed-selection" element={<BreedSelection />} />

            {/* Pet Category */}
            <Route path="/pet-category" element={<PetCategory />} />

            {/* Breed Pets */}
            <Route path="/breed-pets" element={<BreedPets />} />

            {/* Pet Details */}
            <Route path="/pet-details" element={<PetDetails />} />

            {/* Liked Pets */}
            <Route path="/liked-pets" element={<LikedPets />} />

            {/* My Bookings */}
            <Route path="/my-bookings" element={<MyBookings />} />

            {/* Payment Methods */}
            <Route path="/payment-methods" element={<PaymentMethods />} />

            {/* Notification Settings */}
            <Route
              path="/notification-settings"
              element={<NotificationSettings />}
            />

            {/* App Settings */}
            <Route path="/app-settings" element={<AppSettings />} />

            {/* Booking Confirmation */}
            <Route
              path="/booking-confirmation"
              element={<BookingConfirmation />}
            />

            {/* Booking Review */}
            <Route path="/booking-review" element={<BookingReview />} />

            {/* Cart */}
            <Route path="/cart" element={<Cart />} />

            {/* About Us */}
            <Route path="/about-us" element={<AboutUs />} />

            {/* Terms of Service */}
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Privacy Policy */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* ================================
                DEFAULT ROUTE
            ================================= */}

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Unknown route → Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </IonRouterOutlet>

          {/* =================================
              BOTTOM TAB BAR
          ================================= */}

          <IonTabBar slot="bottom">
            {/* Home */}
            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            {/* Shop */}
            <IonTabButton tab="shop" href="/shop">
              <IonIcon icon={storefrontOutline} />
              <IonLabel>Shop</IonLabel>
            </IonTabButton>

            {/* Training */}
            <IonTabButton tab="training" href="/training">
              <IonIcon icon={schoolOutline} />
              <IonLabel>Training</IonLabel>
            </IonTabButton>

            {/* History */}
            <IonTabButton tab="history" href="/history">
              <IonIcon icon={timeOutline} />
              <IonLabel>History</IonLabel>
            </IonTabButton>

            {/* Profile */}
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personOutline} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

/* =====================================
   SPLASH SCREEN
===================================== */

export const SplashScreen = (): JSX.Element => {
  return (
    <div className="splash-screen-frame">
      <div className="splash-screen">
        {/* Logo */}
        <div className="splash-logo-wrap">
          <img className="img-photoroom" src={logo} alt="PawBorrow logo" />
        </div>

        {/* Arch */}
        <div className="splash-arch" aria-hidden="true" />

        {/* Pets */}
        <div className="splash-pet-row">
          <div className="pet-card">
            <img
              className="pet-photo"
              src={bernerSennenhundPuppiesPosing1}
              alt="Cute dog"
            />
          </div>

          <div className="pet-card pet-card--middle">
            <img className="pet-photo" src={image12} alt="Dog sitting" />
          </div>

          <div className="pet-card">
            <img
              className="pet-photo"
              src={closeupShotOneGingerCatHuggingLickingOtherIsolatedWhiteWall1}
              alt="Cat and dog"
            />
          </div>
        </div>

        {/* Vector */}
        <img className="splash-vector" src={vector} alt="" aria-hidden="true" />

        {/* Pet stand */}
        <div className="pet-stand" aria-hidden="true">
          <div className="pet-stand-inner" aria-hidden="true" />
        </div>

        {/* Bottom bar */}
        <div className="splash-bottom-bar" />
      </div>
    </div>
  );
};

export default App;
