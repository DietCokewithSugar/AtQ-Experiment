/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SVGAttributes } from "react";
import logo from "/logo.png";

export function Logo({
  size,
  ...props
}: SVGAttributes<HTMLImageElement> & {
  size?: number;
}) {
  return (
    <img
      alt="Logo"
      width={size || 64}
      height={size || 64}
      {...props}
      src={logo}
    />
  );
}
