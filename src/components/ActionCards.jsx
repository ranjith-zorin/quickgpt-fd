import { Row, Col } from "react-bootstrap";
import { Search, Display } from "react-bootstrap-icons";
import ActionCard from "./ActionCard.jsx";

export default function ActionCards() {
  return (
    <Row className="g-3 mt-4">
      <Col xs={12} sm={6}>
        <ActionCard variant="search" Icon={Search} title="Search anything">
          Get fast and accurate answers from the most trusted sources.
        </ActionCard>
      </Col>
      <Col xs={12} sm={6}>
        <ActionCard variant="computer" Icon={Display} title="Get work done with Computer" badge="NEW">
          Hand off your projects to get polished, reliable deliverables around the clock.
        </ActionCard>
      </Col>
    </Row>
  );
}
