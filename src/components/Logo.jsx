import { Asterisk } from "react-bootstrap-icons";

export default function Logo({ size = 26 }) {
  return (
    <span className="px-logo" aria-label="Perplexity">
      <Asterisk size={size} />
    </span>
  );
}
