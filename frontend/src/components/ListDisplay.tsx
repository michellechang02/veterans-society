import React from "react";
import { VeteranResource } from "../Api/OverpassService";

interface ListDisplayProps {
  resources: VeteranResource[];
}

export const ListDisplay: React.FC<ListDisplayProps> = () => {
  return <div>List Display Component - To be implemented in Phase 4</div>;
};
