import { useNavigate } from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  chevronForwardOutline,
  logOutOutline,
  settingsOutline,
} from "ionicons/icons";

import { useAuth } from "../context/AuthContext";
import "../style/Profile.css";

/*
 * Images inside public are referenced with
 * URL paths. Do not import them.
 */
const avatar =
  "/images/dashboard/avatar-sarah.png";

const fallbackAvatar =
  "/images/logo.png";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const {
    logout,
    user,
  } = useAuth();

  const profileName =
    user?.displayName?.trim() ||
    user?.fullName?.trim() ||
    user?.email?.split("@")[0] ||
    "PawBorrow User";

  const fullName =
    user?.fullName?.trim() ||
    user?.displayName?.trim() ||
    "Not provided";

  const phoneNumber =
    user?.phoneNumber?.trim() ||
    "Not provided";

  const accountCreated =
    user?.accountCreated?.trim() ||
    "Not available";

  const email =
    user?.email?.trim() ||
    "Email not available";

  async function handleLogout() {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );
    }
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="profile-content"
      >
        <div className="profile-page">
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              <img
                className="profile-avatar"
                src={avatar}
                alt={`${profileName} profile`}
                onError={(event) => {
                  event.currentTarget.onerror =
                    null;

                  event.currentTarget.src =
                    fallbackAvatar;
                }}
              />
            </div>

            <p className="profile-name">
              {profileName}
            </p>

            <p className="profile-email">
              {email}
            </p>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-label">
                Display name
              </span>

              <span className="profile-field-value">
                {profileName}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                Full Name
              </span>

              <span className="profile-field-value">
                {fullName}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                Phone Number
              </span>

              <span className="profile-field-value">
                {phoneNumber}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                Account created since
              </span>

              <span className="profile-field-value">
                {accountCreated}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-settings-btn"
              onClick={() =>
                navigate("/app-settings")
              }
            >
              <span className="profile-settings-label">
                <IonIcon
                  icon={settingsOutline}
                  className="profile-settings-icon"
                />

                Settings
              </span>

              <IonIcon
                icon={chevronForwardOutline}
                className="profile-settings-arrow"
              />
            </button>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={() => {
                void handleLogout();
              }}
            >
              <span className="profile-logout-label">
                <IonIcon
                  icon={logOutOutline}
                  className="profile-logout-icon"
                />

                Logout
              </span>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;