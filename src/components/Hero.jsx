import { useState } from "react";
import { Display } from "react-bootstrap-icons";

export default function Hero({hdg}) {

  return (
    <div className="px-hero">
      <Display size={24} />
      <h1>{hdg}</h1>
    </div>
  );
}
