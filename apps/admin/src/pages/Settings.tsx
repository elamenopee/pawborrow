import { useState } from "react";
import {
  Bell,
  Moon,
  ShieldCheck,
} from "lucide-react";

import Header from "../components/Header";

export default function Settings() {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(
    localStorage.getItem(
      "admin-notifications-enabled",
    ) !== "false",
  );

  const [
    compactMode,
    setCompactMode,
  ] = useState(
    localStorage.getItem(
      "admin-compact-mode",
    ) === "true",
  );

  function handleNotificationsChange(
    enabled: boolean,
  ) {
    setNotificationsEnabled(enabled);

    localStorage.setItem(
      "admin-notifications-enabled",
      String(enabled),
    );
  }

  function handleCompactModeChange(
    enabled: boolean,
  ) {
    setCompactMode(enabled);

    localStorage.setItem(
      "admin-compact-mode",
      String(enabled),
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="SETTINGS" />

      <div className="p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Admin Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your PawBorrow admin
              preferences.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SettingRow
              icon={<Bell size={19} />}
              title="Notifications"
              description="Show real-time booking and system notifications."
            >
              <Toggle
                checked={
                  notificationsEnabled
                }
                onChange={
                  handleNotificationsChange
                }
              />
            </SettingRow>

            <SettingRow
              icon={<Moon size={19} />}
              title="Compact display"
              description="Use smaller spacing in admin tables."
            >
              <Toggle
                checked={compactMode}
                onChange={
                  handleCompactModeChange
                }
              />
            </SettingRow>

            <SettingRow
              icon={
                <ShieldCheck size={19} />
              }
              title="Account role"
              description="Your account has administrator access."
            >
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                Admin
              </span>
            </SettingRow>
          </div>
        </div>
      </div>
    </div>
  );
}

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingRow({
  icon,
  title,
  description,
  children,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-100 px-6 py-5 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

type ToggleProps = {
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
};

function Toggle({
  checked,
  onChange,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative h-6 w-11 rounded-full transition ${
        checked
          ? "bg-sky-500"
          : "bg-gray-300"
      }`}
      onClick={() =>
        onChange(!checked)
      }
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked
            ? "left-[22px]"
            : "left-0.5"
        }`}
      />
    </button>
  );
}