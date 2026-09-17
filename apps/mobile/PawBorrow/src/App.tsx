import {
  useEffect,
  useState,
} from "react";
import {
  Navigate,
  Route,
} from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notification from "./pages/Notification";
import History from "./pages/History";
import Profile from "./pages/Profile";
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
import Review from "./pages/Review";

import BottomNav from "./components/BottomNav";
import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

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

import "./App.css";

setupIonicReact();

const splashDogPhoto =
  "/images/pets/berner-sennenhund-puppies-posing-1.png";

const splashCatDogPhoto =
  "/images/pets/closeup-shot-one-ginger-cat-hugging-licking-other-isolated-white-wall-1.png";

const splashMiddlePhoto =
  "/images/pets/image-12.png";

const logo = "/images/logo.png";

const vector =
  "/images/splash/vector.svg";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const [splashLoading, setSplashLoading] =
    useState(true);

  const {
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  useEffect(() => {
    const loadingTimer =
      window.setTimeout(() => {
        setSplashLoading(false);
      }, 1500);

    return () => {
      window.clearTimeout(loadingTimer);
    };
  }, []);

  if (splashLoading || authLoading) {
    return (
      <IonApp>
        <SplashScreen />
      </IonApp>
    );
  }

  if (!isLoggedIn) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/terms-of-service"
              element={<TermsOfService />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/notification"
            element={<Notification />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/liked-pets"
            element={<LikedPets />}
          />

          <Route
            path="/about-us"
            element={<AboutUs />}
          />

          <Route
            path="/pet-category"
            element={<PetCategory />}
          />

          <Route
            path="/breed-selection/:animalId"
            element={<BreedSelection />}
          />

          {/*
           * Primary route used by BreedSelection.
           */}
          <Route
            path="/breed-pets/:animalId/:breedId"
            element={<BreedPets />}
          />

          {/*
           * Compatibility route for any existing
           * navigation still using /dashboard/breed.
           */}
          <Route
            path="/dashboard/breed/:animalId/:breedId"
            element={<BreedPets />}
          />

          <Route
            path="/dashboard/pet/:petId"
            element={<PetDetails />}
          />

          <Route
            path="/pet/:petId"
            element={<PetDetails />}
          />

          <Route
            path="/my-bookings"
            element={<MyBookings />}
          />

          <Route
  path="/review/:bookingId"
  element={<Review />}
/>

          <Route
            path="/payment-methods"
            element={<PaymentMethods />}
          />

          <Route
            path="/notification-settings"
            element={
              <NotificationSettings />
            }
          />

          <Route
            path="/app-settings"
            element={<AppSettings />}
          />

          <Route
            path="/booking-review"
            element={<BookingReview />}
          />

          <Route
            path="/booking-confirmation"
            element={
              <BookingConfirmation />
            }
          />

          <Route
            path="/terms-of-service"
            element={<TermsOfService />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/login"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </IonRouterOutlet>

        <BottomNav />
      </IonReactRouter>
    </IonApp>
  );
};

export const SplashScreen: React.FC =
  () => {
    function useFallbackImage(
      event: React.SyntheticEvent<
        HTMLImageElement
      >,
    ) {
      event.currentTarget.onerror = null;
      event.currentTarget.src = logo;
    }

    return (
      <div className="splash-screen-frame">
        <div className="splash-screen">
          <div className="splash-logo-wrap">
            <img
              className="img-photoroom"
              src={logo}
              alt="PawBorrow logo"
            />
          </div>

          <div
            className="splash-arch"
            aria-hidden="true"
          />

          <div className="splash-pet-row">
            <div className="pet-card">
              <img
                className="pet-photo"
                src={splashDogPhoto}
                alt="Cute dog"
                onError={useFallbackImage}
              />
            </div>

            <div className="pet-card pet-card--middle">
              <img
                className="pet-photo"
                src={splashMiddlePhoto}
                alt="Dog sitting"
                onError={useFallbackImage}
              />
            </div>

            <div className="pet-card">
              <img
                className="pet-photo"
                src={splashCatDogPhoto}
                alt="Cat and dog"
                onError={useFallbackImage}
              />
            </div>
          </div>

          <img
            className="splash-vector"
            src={vector}
            alt=""
            aria-hidden="true"
          />

          <div
            className="pet-stand"
            aria-hidden="true"
          >
            <div
              className="pet-stand-inner"
              aria-hidden="true"
            />
          </div>

          <div className="splash-bottom-bar" />
        </div>
      </div>
    );
  };

export default App;