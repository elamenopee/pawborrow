import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useCategories } from "@repo/api";

import SearchBar from "../components/SearchBar";
import "../style/PetCategory.css";

/*
 * Files inside public are accessed using URLs
 * beginning with "/". They should not be imported.
 */
const placeholderPhoto =
  "/images/utils/placeholder.png";

const categoryPhotos: Record<
  string,
  string
> = {
  capybara:
    "/images/pets/category-guinea-pigs.jpg",
  capybaras:
    "/images/pets/category-guinea-pigs.jpg",

  cat: "/images/pets/category-cats.jpg",
  cats: "/images/pets/category-cats.jpg",

  dog: "/images/pets/category-dogs.jpg",
  dogs: "/images/pets/category-dogs.jpg",

  rabbit:
    "/images/pets/category-rabbits.jpg",
  rabbits:
    "/images/pets/category-rabbits.jpg",
};

function matchesSearch(
  value: string,
  searchTerm: string,
): boolean {
  const normalizedValue = value
    .trim()
    .toLowerCase();

  const normalizedSearch = searchTerm
    .trim()
    .toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return normalizedValue.includes(
    normalizedSearch,
  );
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryPhoto(
  categoryName: string,
): string {
  const normalizedCategory = categoryName
    .trim()
    .toLowerCase();

  return (
    categoryPhotos[normalizedCategory] ??
    placeholderPhoto
  );
}

const PetCategory: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories();

  const filteredCategories =
    categories.filter((category) =>
      matchesSearch(
        category.label,
        searchTerm,
      ),
    );

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="category-content"
      >
        <div className="category">
          <header className="category-header">
            <button
              type="button"
              className="category-back"
              aria-label="Back to dashboard"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>Pets</h1>
          </header>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search pet categories..."
          />

          <div className="category-section-header">
            <h2>Our Pets</h2>
          </div>

          {isLoading && (
            <p className="category-message">
              Loading categories...
            </p>
          )}

          {isError && (
            <div className="category-error">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load categories."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            filteredCategories.length ===
              0 && (
              <p className="category-message">
                No pet categories found.
              </p>
            )}

          {!isLoading &&
            !isError &&
            filteredCategories.length >
              0 && (
              <div className="category-grid">
                {filteredCategories.map(
                  (category) => {
                    const categorySlug =
                      createSlug(
                        category.label,
                      );

                    const categoryPhoto =
                      getCategoryPhoto(
                        category.label,
                      );

                    return (
                      <button
                        type="button"
                        className="category-card"
                        key={category.id}
                        aria-label={`Browse ${category.label}`}
                        onClick={() =>
                          navigate(
                            `/breed-selection/${categorySlug}`,
                          )
                        }
                      >
                        <img
                          src={categoryPhoto}
                          alt={category.label}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              placeholderPhoto;
                          }}
                        />

                        <span>
                          {category.label}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PetCategory;