import {
  Plus, Display, ClockHistory, LayoutSidebarInset, Hexagon, Collection, Clock,
} from "react-bootstrap-icons";

const navItems = [
  { id: "new", label: "New thread", Icon: Plus },
  { id: "computer", label: "Computer", Icon: Display },
  { id: "discover", label: "Discover", Icon: ClockHistory },
  { id: "spaces", label: "Spaces", Icon: LayoutSidebarInset },
  { id: "finance", label: "Finance", Icon: Hexagon },
  { id: "library", label: "Library", Icon: Collection },
  { id: "history", label: "History", Icon: Clock },
];

export default navItems;
