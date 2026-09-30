import {
  useMemo,
  useState,
} from "react";

import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";

import { notificationsOutline } from "ionicons/icons";

import { useNavigate } from "react-router-dom";

import {
  useBookings,
  usePets,
} from "@repo/api";

import SearchBar from "../components/SearchBar";
import NotificationBadge from "../components/NotificationBadge";

import { matchesSearch } from "../../public/images/utils/search";

import { useAuth } from "../context/AuthContext";

import "../style/Dashboard.css";

// ========================================
// Default Images
// ========================================

const defaultAvatar =
  "/images/dashboard/avatar-sarah.png";

const petsBanner =
  "/images/dashboard/pets-banner.png";

const catPhoto =
  "/images/dashboard/cat.png";

const dogPhoto =
  "/images/pets/Dogs/Pug/Edgar.jpg";

const rabbitPhoto =
  "/images/pets/Rabbits/Flemish/Maple.jpg";

const capybaraPhoto =
  "/images/pets/Capybara/Less/Carlos.jpg";

const bookNowPhoto =
  "/images/dashboard/book-now.png";

const communityPhoto =
  "/images/dashboard/community.png";

const fallbackImage =
  "/images/logo.png";

// ========================================
// Category Images
// ========================================

const categoryImages: Record<
  string,
  string
> = {
  cat: catPhoto,
  cats: catPhoto,

  dog: dogPhoto,
  dogs: dogPhoto,

  rabbit: rabbitPhoto,
  rabbits: rabbitPhoto,

  capybara: capybaraPhoto,
  capybaras: capybaraPhoto,

  "guinea pig": capybaraPhoto,
  "guinea pigs": capybaraPhoto,
};

// ========================================
// Create URL Slug
// ========================================

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ========================================
// Greeting
// ========================================

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning!";
  }

  if (hour < 18) {
    return "Good Afternoon!";
  }

  return "Good Evening!";
}

// ========================================
// Dashboard
// ========================================

export const Dashboard = () => {
  const navigate = useNavigate();

  // ========================================
  // Authenticated User
  // ========================================
  //
  // `user` is already the profile loaded
  // from the `user_profiles` table.
  //
  // Available properties:
  //
  // user.firstName
  // user.lastName
  // user.fullName
  // user.avatarUrl
  // user.email
  //
  // ========================================

  const { user } = useAuth();

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  // ========================================
  // Pets
  // ========================================

  const {
    data: pets = [],
    isLoading: petsLoading,
    isError: petsError,
  } = usePets();

  // ========================================
  // Bookings
  // ========================================

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useBookings();

  // ========================================
  // Create Categories From Pets
  // ========================================

  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      {
        id: string;
        label: string;
        photo: string;
        count: number;
      }
    >();

    pets.forEach((pet) => {
      const categoryName =
        pet.category?.trim();

      if (!categoryName) {
        return;
      }

      const normalizedName =
        categoryName.toLowerCase();

      const existing =
        categoryMap.get(
          normalizedName,
        );

      // Category already exists
      if (existing) {
        existing.count += 1;
        return;
      }

      // New category
      categoryMap.set(
        normalizedName,
        {
          id: createSlug(
            categoryName,
          ),

          label: categoryName,

          photo:
            categoryImages[
              normalizedName
            ] ??
            pet.image ??
            capybaraPhoto,

          count: 1,
        },
      );
    });

    return Array.from(
      categoryMap.values(),
    ).sort(
      (first, second) =>
        first.label.localeCompare(
          second.label,
        ),
    );
  }, [pets]);

  // ========================================
  // Search Categories
  // ========================================

  const filteredCategories =
    categories.filter(
      (category) =>
        matchesSearch(
          category.label,
          searchTerm,
        ),
    );

  // ========================================
  // Notification Count
  // ========================================
  //
  // The booking API currently has no
  // read/unread notification field.
  //
  // So we show pending + confirmed
  // bookings as the badge count.
  //
  // ========================================

  const notificationCount =
    bookings.filter((booking) => {
      const status =
        booking.status.toLowerCase();

      return (
        status === "pending" ||
        status === "confirmed"
      );
    }).length;

  // ========================================
  // USER PROFILE
  // ========================================
  //
  // Data comes from:
  //
  // public.user_profiles
  //
  // first_name
  // last_name
  // avatar_url
  //
  // AuthContext converts them into:
  //
  // firstName
  // lastName
  // avatarUrl
  //
  // ========================================

  const displayName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "PawBorrow User";

  const avatar =
    user?.avatarUrl ||
    defaultAvatar;

  // ========================================
  // Render
  // ========================================

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="dashboard-content"
      >
        <div className="dashboard">

          {/* ==================================
              HEADER
          ================================== */}

          <header className="dashboard-header">

            {/* User Information */}

            <div className="dashboard-user">

              <button
                type="button"
                className="dashboard-avatar-btn"
                aria-label="Go to profile"
                onClick={() =>
                  navigate("/profile")
                }
              >
                <img
                  className="dashboard-avatar"
                  src={avatar}
                  alt={`${displayName}'s profile`}
                  onError={(event) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      defaultAvatar;
                  }}
                />
              </button>

              <div>

                <p className="dashboard-greeting">
                  Hello, {displayName}
                </p>

                <p className="dashboard-subgreeting">
                  {getGreeting()}
                </p>

              </div>

            </div>

            {/* Notifications */}

            <button
              type="button"
              className="dashboard-icon-btn"
              aria-label="Notifications"
              onClick={() =>
                navigate(
                  "/notification",
                )
              }
            >
              <div className="dashboard-icon-wrap">

                <IonIcon
                  icon={
                    notificationsOutline
                  }
                />

                <NotificationBadge
                  count={
                    notificationCount
                  }
                  ariaLabel="Booking notifications"
                />

              </div>
            </button>

          </header>

          {/* ==================================
              SEARCH
          ================================== */}

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search pet categories"
          />

          {/* ==================================
              PROMO BANNER
          ================================== */}

          <div className="dashboard-promo">

            <div className="dashboard-promo-text">

              <p className="dashboard-promo-title">
                In Love with Pets?
              </p>

              <p className="dashboard-promo-subtitle">
                Find a companion to borrow
                today.
              </p>

            </div>

            <img
              className="dashboard-promo-photo"
              src={petsBanner}
              alt="Pets"
            />

          </div>

          {/* ==================================
              CATEGORY
          ================================== */}

          <section className="dashboard-section">

            <div className="dashboard-section-header">

              <h2>
                Category
              </h2>

              <button
                type="button"
                className="dashboard-see-all"
                onClick={() =>
                  navigate(
                    "/pet-category",
                  )
                }
              >
                See All
              </button>

            </div>

            {/* Loading */}

            {petsLoading && (
              <p>
                Loading pet categories...
              </p>
            )}

            {/* Error */}

            {petsError && (
              <p>
                Failed to load pet
                categories.
              </p>
            )}

            {/* No Categories */}

            {!petsLoading &&
              !petsError &&
              filteredCategories.length ===
                0 && (
                <p>
                  No pet categories found.
                </p>
              )}

            {/* Categories */}

            {!petsLoading &&
              !petsError &&
              filteredCategories.length >
                0 && (
                <div className="dashboard-categories">

                  {filteredCategories.map(
                    (category) => (
                      <button
                        type="button"
                        className="dashboard-category"
                        key={category.id}
                        onClick={() =>
                          navigate(
                            `/breed-selection/${category.id}`,
                          )
                        }
                      >

                        <img
                          src={
                            category.photo ||
                            fallbackImage
                          }
                          alt={
                            category.label
                          }
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              fallbackImage;
                          }}
                        />

                        <span>
                          {
                            category.label
                          }
                        </span>

                        <small>
                          {
                            category.count
                          }{" "}
                          {category.count ===
                          1
                            ? "pet"
                            : "pets"}
                        </small>

                      </button>
                    ),
                  )}

                </div>
              )}

          </section>

          {/* ==================================
              BOOK NOW
          ================================== */}

          <section className="dashboard-section">

            <h2>
              Book Now
            </h2>

            <div className="dashboard-card">

              <div className="dashboard-card-text">

                <p>
                  Find an available
                  companion and create
                  a booking.
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate(
                      "/pet-category",
                    )
                  }
                >
                  See Pets
                </button>

              </div>

              <img
                src={bookNowPhoto}
                alt="Book a pet"
              />

            </div>

          </section>

          {/* ==================================
              MY BOOKINGS
          ================================== */}

          <section className="dashboard-section">

            <h2>
              My Bookings
            </h2>

            <div className="dashboard-card">

              <div className="dashboard-card-text">

                <p>
                  {bookingsLoading
                    ? "Loading your bookings..."
                    : `You have ${
                        bookings.length
                      } ${
                        bookings.length ===
                        1
                          ? "booking"
                          : "bookings"
                      }.`}
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate(
                      "/my-bookings",
                    )
                  }
                >
                  View Bookings
                </button>

              </div>

              <img
                src={communityPhoto}
                alt="My bookings"
              />

            </div>

          </section>

          {/* ==================================
              ABOUT US
          ================================== */}

          <section className="dashboard-section">

            <h2>
              About Us
            </h2>

            <div className="dashboard-card">

              <div className="dashboard-card-text">

                <p>
                  Meet the team behind
                  PawBorrow and our
                  pet-first mission.
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate(
                      "/about-us",
                    )
                  }
                >
                  See More
                </button>

              </div>

              <img
                src={communityPhoto}
                alt="About us"
              />

            </div>

          </section>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;