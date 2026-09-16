import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Navigate, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { BookingsProvider } from "./context/BookingsContext";

import ProtectedRoute from "./router/ProtectedRoute";
import PublicRoute from "./router/PublicRoute";

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
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

// Ionic CSS
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

// App CSS
import "./App.css";
import "./global.css";

const App = () => {
  return (
    <IonApp>
      <AuthProvider>
        <BookingsProvider>
          <IonReactRouter>
            <IonRouterOutlet>

              {/* =========================
                  PUBLIC ROUTES
              ========================== */}

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
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

              {/* =========================
                  PROTECTED ROUTES
              ========================== */}

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <Shop />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/breed-selection"
                element={
                  <ProtectedRoute>
                    <BreedSelection />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pet-category"
                element={
                  <ProtectedRoute>
                    <PetCategory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/breed-pets"
                element={
                  <ProtectedRoute>
                    <BreedPets />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pet-details/:id"
                element={
                  <ProtectedRoute>
                    <PetDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/about-us"
                element={
                  <ProtectedRoute>
                    <AboutUs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/liked-pets"
                element={
                  <ProtectedRoute>
                    <LikedPets />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment-methods"
                element={
                  <ProtectedRoute>
                    <PaymentMethods />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notification-settings"
                element={
                  <ProtectedRoute>
                    <NotificationSettings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app-settings"
                element={
                  <ProtectedRoute>
                    <AppSettings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/booking-confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/booking-review"
                element={
                  <ProtectedRoute>
                    <BookingReview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />

              {/* =========================
                  DEFAULT ROUTE
              ========================== */}

              <Route
                path="/"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

              {/* =========================
                  UNKNOWN ROUTES
              ========================== */}

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
          </IonReactRouter>
        </BookingsProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;