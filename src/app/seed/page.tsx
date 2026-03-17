"use client";

import { useEffect, useState } from "react";
import { seedAlgorithms } from "@/lib/algorithmsDb";

export default function SeedPage() {
  const [status, setStatus] = useState("Waiting...");

  useEffect(() => {
    seedAlgorithms()
      .then(() => setStatus("Successfully seeded the database!"))
      .catch((e) => setStatus("Error: " + e.message));
  }, []);

  return <div className="p-10 text-white">{status}</div>;
}
