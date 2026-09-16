import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { IonIcon } from "@ionic/react";
import {
  home,
  heartOutline,
  timeOutline,
  personOutline,
  pawOutline,
} from "ionicons/icons";

import "./BottomNav.css";

const VISIBLE_ON = [
  "/dashboard",
  "/pet-category",
  "/liked-pets",
  "/history",
  "/profile",
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const isVisible = VISIBLE_ON.some(
    (path) =>
      currentPath === path ||
      currentPath.startsWith(`${path}/`),
  );

  if (!isVisible) {
    return null;
  }

  function isActive(path: string) {
    return (
      currentPath === path ||
      currentPath.startsWith(`${path}/`)
    );
  }

  return (
    <nav
      className="bottom-nav"
      aria-label="Main navigation"
    >
      <button
        type="button"
        className={`bottom-nav-item ${
          isActive("/dashboard")
            ? "bottom-nav-item--active"
            : ""
        }`}
        aria-label="Home"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <IonIcon icon={home} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${
          isActive("/liked-pets")
            ? "bottom-nav-item--active"
            : ""
        }`}
        aria-label="Liked pets"
        onClick={() =>
          navigate("/liked-pets")
        }
      >
        <IonIcon icon={heartOutline} />
        <span>Liked</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-fab ${
          isActive("/pet-category")
            ? "bottom-nav-fab--active"
            : ""
        }`}
        aria-label="Browse pets"
        onClick={() =>
          navigate("/pet-category")
        }
      >
        <IonIcon icon={pawOutline} />
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${
          isActive("/history")
            ? "bottom-nav-item--active"
            : ""
        }`}
        aria-label="Booking history"
        onClick={() =>
          navigate("/history")
        }
      >
        <IonIcon icon={timeOutline} />
        <span>History</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${
          isActive("/profile")
            ? "bottom-nav-item--active"
            : ""
        }`}
        aria-label="Profile"
        onClick={() =>
          navigate("/profile")
        }
      >
        <IonIcon icon={personOutline} />
        <span>Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;