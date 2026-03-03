/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}