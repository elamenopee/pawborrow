import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";

import {
  homeOutline,
  home,
  heartOutline,
  heart,
  cartOutline,
  timeOutline,
  personOutline,
} from "ionicons/icons";

import { Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import PetCategory from "../pages/PetCategory";
import Shop from "../pages/Shop";
import History from "../pages/History";
import Profile from "../pages/Profile";

const AppTabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/pets"
          element={<PetCategory />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </IonRouterOutlet>

      <IonTabBar
        slot="bottom"
        className="
          h-[108px]
          rounded-b-[20px]
          bg-white
          px-2
          pb-3
          pt-4
          shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        "
      >

        {/* HOME */}
        <IonTabButton
          tab="dashboard"
          href="/dashboard"
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1
            text-[#858697]
          "
        >
          <IonIcon
            icon={homeOutline}
            className="text-[28px]"
          />

          <IonLabel className="text-[16px] font-medium">
            Home
          </IonLabel>
        </IonTabButton>


        {/* PETS */}
        <IonTabButton
          tab="pets"
          href="/pets"
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1
            text-[#858697]
          "
        >
          <IonIcon
            icon={heartOutline}
            className="text-[28px]"
          />

          <IonLabel className="text-[16px] font-medium">
            Pets
          </IonLabel>
        </IonTabButton>


        {/* SHOP */}
        <IonTabButton
          tab="shop"
          href="/shop"
          className="
            relative
            flex
            flex-col
            items-center
            justify-center
            text-white
          "
        >
          <div
            className="
              absolute
              -top-[42px]
              flex
              h-[88px]
              w-[88px]
              flex-col
              items-center
              justify-center
              rounded-full
              bg-[#FF963F]
              shadow-[0_8px_25px_rgba(0,0,0,0.15)]
              ring-[10px]
              ring-white
            "
          >
            <IonIcon
              icon={cartOutline}
              className="text-[32px]"
            />

            <IonLabel className="mt-0.5 text-[16px] font-medium">
              Shop
            </IonLabel>
          </div>
        </IonTabButton>


        {/* HISTORY */}
        <IonTabButton
          tab="history"
          href="/history"
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1
            text-[#858697]
          "
        >
          <IonIcon
            icon={timeOutline}
            className="text-[28px]"
          />

          <IonLabel className="text-[16px] font-medium">
            History
          </IonLabel>
        </IonTabButton>


        {/* PROFILE */}
        <IonTabButton
          tab="profile"
          href="/profile"
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1
            text-[#858697]
          "
        >
          <IonIcon
            icon={personOutline}
            className="text-[28px]"
          />

          <IonLabel className="text-[16px] font-medium">
            Profile
          </IonLabel>
        </IonTabButton>

      </IonTabBar>
    </IonTabs>
  );
};

export default AppTabs;