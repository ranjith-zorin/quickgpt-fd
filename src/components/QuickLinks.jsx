import { Folder2 } from "react-bootstrap-icons";

export default function QuickLinks() {
  return (
    <div className="px-quick">
      <button><Folder2 size={12} /> Work in a project</button>
      <button>
        <span aria-hidden="true" className="d-inline-flex gap-1">
          <i style={{ width: 9, height: 9, background: "#ea4335", borderRadius: 2 }} />
          <i style={{ width: 9, height: 9, background: "#4285f4", borderRadius: 2 }} />
          <i style={{ width: 9, height: 9, background: "#34a853", borderRadius: 2 }} />
        </span>
        Connect an app
      </button>
    </div>
  );
}
