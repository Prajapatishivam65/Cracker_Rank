"use client";

import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/auth";

export function LogOutButton() {
  return (
    <Button variant="destructive" onClick={async () => await logOut()}>
      Log Out
    </Button>
  );
}
