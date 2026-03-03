/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuthContext } from "@/auth/AuthProvider";
import { Button, Code, Link } from "@radix-ui/themes";
import { ArrowRightIcon } from "lucide-react";
import { Onboarding } from "./Onboarding";

export function LoginScreen() {
  const { signIn } = useAuthContext();
  return (
    <Onboarding.Container>
      <Onboarding.Logo />
      <Onboarding.Title>
        Hi, I'm <Code>@Q</Code>! (yes,{" "}
        <Link
          href="https://en.wikipedia.org/wiki/Q_(James_Bond)"
          target="_blank"
        >
          that one
        </Link>
        )
      </Onboarding.Title>
      <Onboarding.Description>
        I build on-the-fly collaboration tools for teams, powered by Gemini!
      </Onboarding.Description>
      <Button onClick={() => signIn()}>
        Sign in with Google
        <ArrowRightIcon size={16} />
      </Button>
    </Onboarding.Container>
  );
}
