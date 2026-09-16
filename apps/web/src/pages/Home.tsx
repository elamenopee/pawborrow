import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import FAQS from "@/components/ui/Faq";
import "@/styles/Home.css";
import "@/styles/Button.css";
import { MapPin, CalendarDays, PawPrint } from "lucide-react";
import { usePets } from "@repo/api";

type PawTileProps = {
  tone?: "coral" | "peach" | "sage" | "sand" | "ink";
  label?: string;
  className?: string;
};

type PhotoTileProps = {
  src: string;
  alt: string;
  tone?: "coral" | "peach" | "sage" | "sand" | "ink";
  className?: string;
};

const PETS = [
  {
    name: "Milo",
    breed: "Persian Cat",
    price: "₱250/day",
    tone: "coral" as const,
    image: "/images/featured-milo.jpg",
  },
  {
    name: "Buddy",
    breed: "Pug",
    price: "₱300/day",
    tone: "peach" as const,
    image: "/images/featured-buddy.jpg",
  },
  {
    name: "Bella",
    breed: "Golden Retriever",
    price: "₱280/day",
    tone: "sand" as const,
    image: "/images/featured-bella.jpg",
  },
];

const TONES: Record<string, { bg: string; paw: string }> = {
  coral: { bg: "#FBE4E1", paw: "#EE7B6E" },
  peach: { bg: "#FBE9D7", paw: "#F0A857" },
  sage: { bg: "#E7EFE4", paw: "#8AA37B" },
  sand: { bg: "#F1EDE6", paw: "#C7A97A" },
  ink: { bg: "#E9E9E9", paw: "#1B1B1B" },
};

const CATEGORIES = [
  {
    name: "Cats",
    tone: "coral" as const,
    image: "/images/category-cats.jpg",
    filterCategory: "Cat",
  },
  {
    name: "Dogs",
    tone: "peach" as const,
    image: "/images/category-dogs.jpg",
    filterCategory: "Dog",
  },
  {
    name: "Capybaras",
    tone: "sage" as const,
    image: "/images/pets/Capybara/Great/Coco.jpg",
    filterCategory: "Capybara",
  },
  {
    name: "Rabbits",
    tone: "sand" as const,
    image: "/images/category-rabbits.jpg",
    filterCategory: "Rabbit",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedPets />
      <SecondaryHero />
      <MobileApp />
      <FAQS />
      <Footer />
    </>
  );
}

function PawTile({ tone = "sand", label, className = "" }: PawTileProps) {
  const { bg, paw } = TONES[tone];
  return (
    <div
      className={`paw-tile ${className}`}
      style={{ background: bg }}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 64 64" className="paw-tile__icon" style={{ fill: paw }}>
        <ellipse cx="32" cy="40" rx="15" ry="12" />
        <ellipse cx="14" cy="24" rx="6" ry="8" />
        <ellipse cx="27" cy="14" rx="6.5" ry="8.5" />
        <ellipse cx="41" cy="14" rx="6.5" ry="8.5" />
        <ellipse cx="52" cy="26" rx="6" ry="8" />
      </svg>
      {label && <span className="paw-tile__label">{label}</span>}
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__text">
        <p className="eyebrow">PawBorrow &middot; Quezon City</p>
        <h1>
          {" "}
          Pet companionship, <br /> borrowed <span>your way.</span>
        </h1>
        <p className="hero__sub">
          Not ready to commit to full-time pet ownership? Borrow a cat, dog, rabbit, and capybara for a day, a weekend, or however long you need the company.
        </p>
        <div className="hero__actions">
          <Link
            to="/pets"
            className="rounded-full bg-froly-400 py-3.5 px-6.5 font-medium text-white"
          >
            Browse Pets
          </Link>
        </div>
      </div>

      <div className="hero__art">
        <div className="hero__blob" aria-hidden="true" />
        <img
          src="/images/Ca4.png"
          alt="Three golden retriever puppies available to borrow"
          className="hero__cutout"
        />
      </div>
    </section>
  );
}

function Categories() {
  const {
    data: pets = [],
    isLoading,
    error,
  } = usePets();

  return (
    <section
      id="browse"
      className="section categories"
    >
      <div className="section__head">
        <h2>Browse by companion</h2>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500">
          {error instanceof Error
            ? error.message
            : "Failed to load pet counts."}
        </p>
      )}

      <div className="categories__grid">
        {CATEGORIES.map((category) => {
          const count = pets.filter(
            (pet) =>
              pet.category?.trim().toLowerCase() ===
              category.filterCategory
                .trim()
                .toLowerCase(),
          ).length;

          const countLabel = isLoading
            ? "Loading..."
            : `${count} ${
                count === 1
                  ? "companion"
                  : "companions"
              }`;

          return (
            <Link
              to={`/pets?category=${encodeURIComponent(
                category.filterCategory,
              )}`}
              className="category-card"
              key={category.name}
            >
              <PhotoTile
                src={category.image}
                alt={category.name}
                tone={category.tone}
                className="category-card__image"
              />

              <div className="category-card__meta">
                <div>
                  <h3>{category.name}</h3>
                  <p>{countLabel}</p>
                </div>

                <span
                  className="category-card__arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PhotoTile({
  src,
  alt,
  tone = "sand",
  className = "",
}: PhotoTileProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <PawTile tone={tone} label={alt} className={className} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`photo-tile ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function FeaturedPets() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggleSaved = (name: string) =>
    setSaved((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <section className="section featured">
      <h2>Featured Companions</h2>

      <div className="featured__grid">
        {PETS.map((pet) => (
          <div className="pet-card" key={pet.name}>
            <PhotoTile
              src={pet.image}
              alt={`${pet.name}, ${pet.breed}`}
              tone={pet.tone}
              className="pet-card__image"
            />
            <div className="pet-card__meta">
              <div>
                <h3>{pet.name}</h3>
                <p>{pet.breed}</p>
                <span className="pet-card__price">{pet.price}</span>
              </div>
              <button
                className={`pet-card__save ${saved[pet.name] ? "is-saved" : ""}`}
                onClick={() => toggleSaved(pet.name)}
                aria-label={`Save ${pet.name}`}
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecondaryHero() {
  return (
    <section className="max-w-6xl mx-auto">
      <h2 className="text-3xl xs:text-4xl lg:text-5xl text-froly-400 tracking-tighter font-bold text-center mb-2">
        <span className="text-brand">How</span>
        <span className="text-gray-900"> does it Work?</span>
      </h2>
      <p className="text-center text-sm sm:text-base font-inter text-[#696969] mb-6"></p>

      <div className="container px-0 my-16">
        <div className="flex flex-wrap justify-center gap-8">
          <div className="shadow-xl flex flex-col items-center px-4 py-6 w-62.5 h-57.5 md:w-75 md:h-70 bg-white rounded-3xl font-inter">
            <MapPin size={36} className="text-froly-300 mt-2" />
            <h3 className="text-base md:text-xl mt-4 md:mt-7 font-inter text-froly-400 font-bold text-center mb-4 tracking-tighter">Pick a Buddy</h3>
            <p className="text-sm md:text-base font-inter text-froly-300 text-justify leading-6">Pick the perfect companion for your needs.</p>
          </div>
          <div className="shadow-xl flex flex-col items-center px-4 py-6 w-62.5 h-57.5 md:w-75 md:h-70 bg-white rounded-3xl font-inter">
             <CalendarDays size={36} className="text-froly-300 mt-2" />
            <h3 className="text-base md:text-xl mt-4 md:mt-7 font-inter text-froly-400 font-bold text-center mb-4 tracking-tighter">Choose your Dates</h3>
            <p className="text-sm md:text-base font-inter text-froly-300 text-justify leading-6">Choose the dates you want a buddy for.</p>
          </div>
          <div className="shadow-xl flex flex-col items-center px-4 py-6 w-62.5 h-57.5 md:w-75 md:h-70 bg-white rounded-3xl font-inter">
             <PawPrint size={36} className="text-froly-300 mt-2" />
            <h3 className="text-base md:text-xl mt-4 md:mt-7 font-inter text-froly-400 font-bold text-center mb-4 tracking-tighter">We handle the rest</h3>
            <p className="text-sm md:text-base font-inter text-froly-300 text-justify leading-6">Food, leash, bed, and care instructions included. Return them when your time's up</p>
          </div>
        </div>
      </div>


      <div className="container px-0 my-10 text-center">
        <h1 className="text-1xl xs:text-4xl lg:text-5xl text-froly-400 tracking-tighter gap-2 font-bold text-center mb-2 flex flex-row items-center justify-center">
          Why
          <span className="text-black">choose</span>
          <img src="/images/PawLogo2.png" alt="icon" />
        </h1>
         <h3 className=" hidden md:block font-bold text-2xl md:text-3xl text-background mt-3">
          With the most fluffy poodles, and clingy cats 
          <br className="hidden lg:block" />
          you should get your fair share of cuddles at PawBorrow.
         </h3>
         <p className="text-justify sm:text-center text-sm sm:text-base font-inter text-[#696969] mt-3">
          At PawBorrow, we believe everyone deserves the joy of animal companionship without the lifelong commitment. 
          <br className="hidden lg:block" />
          Whether you're seeking emotional support, a moment of relaxation, or therapeutic comfort,
          <br className="hidden lg:block" />
          our lovingly cared-for fleet of cats, dogs, rabbits, and capybaras is ready to brighten your day. 
          <br className="hidden lg:block" />
          As a proudly Quezon City-based service, we make companionship effortless.
          <br className="hidden lg:block" />
          </p>
      </div>
    </section>
  );
}


function MobileApp() {
  return (
    <section className="mx-auto max-w-(--max-w) px-6 pt-14">
      <div className="flex flex-row items-center justify-center gap-8">
        <div className="flex">
          <img
            src="/images/Mobile.png"
            alt="Mobile app preview"
            className="mt-4 w-full max-w-sm"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-3xl xs:text-4xl lg:text-5xl font-bold">
            Meet your {""}  
            <span className="text-froly-400">
              PawPal
            </span>
           {""} on mobile.
          </h2>
          <p className="text-background font-inter   text-sm sm:text-base font-normal mt-6 leading-5 sm:leading-7">
            Download our app for easy access to our pet companion services.
            <br/>
            You can browse our adorable pawpals, book, and reserve.
            <br/>
            Available both on Android and iOS.
          </p>
          <img
            src="/images/Googleplay.png"
            alt="Google Play Store"
            className="mt-4 w-full max-w-xs"
          />
        </div>
      </div>
    </section>
  );
}

