"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("This is a test error!");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Error Handling System Test</h1>
      <Button onClick={() => setShouldThrow(true)}>Trigger Test Error</Button>
    </div>
  );
}
