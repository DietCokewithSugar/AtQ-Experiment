/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { hashString } from "@/util/hash";
import * as COLORS from "@radix-ui/colors";
import { UserInfo } from "firebase/auth";

const USER_COLORS: (keyof typeof COLORS)[] = [
  "red",
  "pink",
  "purple",
  "indigo",
  "cyan",
  "green",
  "amber",
];

export function globalColorForUser(user: Partial<UserInfo>) {
  let userStr = user.displayName || user.email || user.uid || "Guest";
  let hue = USER_COLORS[hashString(userStr) % USER_COLORS.length];
  return (COLORS[hue] as any)[hue + "9"];
}
