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

const defaultAvatar =
  "/images/dashboard/avatar-sarah.png";

const petsBanner =
  "/images/dashboard/pets-banner.png";

const catPhoto =
  "/images/dashboard/cat.png";

const dogPhoto =
  "/images/dashboard/dog.png";

const rabbitPhoto =
  "/images/dashboard/rabbit.png";

const capybaraPhoto =
  "/images/dashboard/guinea-pig.png";

const bookNowPhoto =
  "/images/dashboard/book-now.png";

const communityPhoto =
  "/images/dashboard/community.png";

const trainingCardPhoto =
  "/images/dashboard/training-card.png";

const fallbackImage =
  "/images/logo.png";

import "../style/Dashboard.css";

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

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] =
    useState("");

  const {
    data: pets = [],
    isLoading: petsLoading,
    isError: petsError,
  } = usePets();

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useBookings();

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
        categoryMap.get(normalizedName);

      if (existing) {
        existing.count += 1;
        return;
      }

      categoryMap.set(normalizedName, {
        id: createSlug(categoryName),
        label: categoryName,
        photo:
          categoryImages[normalizedName] ??
          pet.image ??
          capybaraPhoto,
        count: 1,
      });
    });

    return Array.from(
      categoryMap.values(),
    ).sort((first, second) =>
      first.label.localeCompare(
        second.label,
      ),
    );
  }, [pets]);

  const filteredCategories =
    categories.filter((category) =>
      matchesSearch(
        category.label,
        searchTerm,
      ),
    );

  /*
   * The booking API currently has no read/unread
   * notification field. Show the number of pending
   * and confirmed bookings as the badge count.
   */
  const notificationCount =
    bookings.filter((booking) => {
      const status =
        booking.status.toLowerCase();

      return (
        status === "pending" ||
        status === "confirmed"
      );
    }).length;

  const displayName =
    user?.displayName ||
    user?.firstName ||
    "PawBorrow User";

  const avatar =
    user?.avatarUrl || defaultAvatar;

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="dashboard-content"
      >
        <div className="dashboard">
          <header className="dashboard-header">
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
                  alt={displayName}
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

            <button
              type="button"
              className="dashboard-icon-btn"
              aria-label="Notifications"
              onClick={() =>
                navigate("/notification")
              }
            >
              <div className="dashboard-icon-wrap">
                <IonIcon
                  icon={notificationsOutline}
                />

                <NotificationBadge
                  count={notificationCount}
                  ariaLabel="Booking notifications"
                />
              </div>
            </button>
          </header>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search pet categories"
          />

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

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Category</h2>

              <button
                type="button"
                className="dashboard-see-all"
                onClick={() =>
                  navigate("/pet-category")
                }
              >
                See All
              </button>
            </div>

            {petsLoading && (
              <p>Loading pet categories...</p>
            )}

            {petsError && (
              <p>
                Failed to load pet categories.
              </p>
            )}

            {!petsLoading &&
              !petsError &&
              filteredCategories.length ===
                0 && (
                <p>
                  No pet categories found.
                </p>
              )}

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
                          src={category.photo}
                          alt={category.label}
                        />

                        <span>
                          {category.label}
                        </span>

                        <small>
                          {category.count}{" "}
                          {category.count === 1
                            ? "pet"
                            : "pets"}
                        </small>
                      </button>
                    ),
                  )}
                </div>
              )}
          </section>

          <section className="dashboard-section">
            <h2>Book Now</h2>

            <div className="dashboard-card">
              <div className="dashboard-card-text">
                <p>
                  Find an available companion
                  and create a booking.
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate("/pet-category")
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

          <section className="dashboard-section">
            <h2>My Bookings</h2>

            <div className="dashboard-card">
              <div className="dashboard-card-text">
                <p>
                  {bookingsLoading
                    ? "Loading your bookings..."
                    : `You have ${bookings.length} ${
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
                    navigate("/my-bookings")
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

          <section className="dashboard-section">
            <h2>About Us</h2>

            <div className="dashboard-card">
              <div className="dashboard-card-text">
                <p>
                  Meet the team behind
                  PawBorrow and our pet-first
                  mission.
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate("/about-us")
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

          <section className="dashboard-section">
            <h2>Training</h2>

            <div className="dashboard-card">
              <div className="dashboard-card-text">
                <p>
                  Learn to train your pet from
                  the pros!
                </p>

                <button
                  type="button"
                  className="dashboard-card-btn"
                  onClick={() =>
                    navigate("/training")
                  }
                >
                  See More
                </button>
              </div>

              <img
                src={trainingCardPhoto}
                alt="Training"
              />
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;