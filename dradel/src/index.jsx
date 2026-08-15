import React from "react";
import { createRoot } from "react-dom/client";
import Dradel from "./Dradel.jsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Dradel could not find its #root element.");
}

createRoot(root).render(<Dradel />);
