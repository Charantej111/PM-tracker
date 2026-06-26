import React from "react";
import {
  PMReadinessRadar,
  ProjectStatusPie,
  StudyHoursBar,
  RoadmapCompletionBar,
} from "../charts/ReportCharts";

export default function ReportPrintView({ userData }) {
  if (!userData) return null;

  const skills = userData.skills || [];
  const projects = userData.projects || [];
  const roadmap = userData.roadmap || {};
  const learningItems = userData.learning?.items || [];

  return (
    <div
      id="report-print-view"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "0px",
        width: "500px",
        background: "#ffffff",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div id="print-radar-chart" style={{ width: "400px", height: "240px", background: "#ffffff" }}>
        <PMReadinessRadar skills={skills} />
      </div>
      <div id="print-project-pie-chart" style={{ width: "400px", height: "240px", background: "#ffffff" }}>
        <ProjectStatusPie projects={projects} hideLegend={true} />
      </div>
      <div id="print-study-bar-chart" style={{ width: "400px", height: "240px", background: "#ffffff" }}>
        <StudyHoursBar learningItems={learningItems} />
      </div>
      <div id="print-roadmap-bar-chart" style={{ width: "400px", height: "240px", background: "#ffffff" }}>
        <RoadmapCompletionBar roadmap={roadmap} />
      </div>
    </div>
  );
}
