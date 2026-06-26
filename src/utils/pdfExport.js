import { average, formatDate, formatShortDate, formatReviewReflection } from "./helpers";
import {
  computeWeeklyReport,
  computeMonthlyReport,
  computePMReadinessScore,
  getWeekRange,
  getMonthRange,
} from "./reportUtils";
import { computeRoadmapMetrics } from "./roadmapMetrics";

/**
 * Determines PM readiness tier.
 */
const getReadinessTier = (score) => {
  if (score <= 25) return "Beginner";
  if (score <= 50) return "Developing";
  if (score <= 75) return "Intermediate";
  return "Advanced";
};

/**
 * Safely captures a chart container by ID using html2canvas.
 */
const captureChartImage = async (html2canvas, chartId) => {
  try {
    const el = document.getElementById(chartId);
    if (!el) return null;
    
    // Check if Recharts actually rendered SVGs
    const svg = el.querySelector("svg");
    if (!svg) return null;

    const canvas = await html2canvas(el, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error(`Chart capture failed for #${chartId}:`, error);
    return null;
  }
};

/**
 * Standard table rendering engine for jsPDF (selectable vector text & cells).
 */
const drawPdfTable = (pdf, headers, rows, startX, startY, colWidths, rowHeight = 7.5) => {
  let currentY = startY;
  const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);

  // 1. Header Background (Deep Blue Accent)
  pdf.setFillColor(37, 99, 235);
  pdf.rect(startX, currentY, tableWidth, rowHeight + 2, "F");

  // 2. Header Text
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255); // White

  let currentX = startX;
  headers.forEach((header, idx) => {
    pdf.text(header, currentX + 3, currentY + rowHeight - 0.5);
    currentX += colWidths[idx];
  });

  currentY += rowHeight + 2;

  // 3. Rows
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42); // Slate-900

  rows.forEach((row, rowIndex) => {
    // Dynamic text wrapping check per cell
    const wrappedCells = row.map((cellText, idx) => {
      const maxW = colWidths[idx] - 6;
      return pdf.splitTextToSize(String(cellText), maxW);
    });

    const maxLines = Math.max(...wrappedCells.map((lines) => lines.length), 1);
    const dynamicRowHeight = maxLines * 4.5 + 3.5;

    // Zebra rows background
    if (rowIndex % 2 === 1) {
      pdf.setFillColor(248, 250, 252); // Slate-50
    } else {
      pdf.setFillColor(255, 255, 255); // White
    }
    pdf.rect(startX, currentY, tableWidth, dynamicRowHeight, "F");

    // Divider line bottom
    pdf.setDrawColor(241, 245, 249);
    pdf.setLineWidth(0.2);
    pdf.line(startX, currentY + dynamicRowHeight, startX + tableWidth, currentY + dynamicRowHeight);

    let cellX = startX;
    row.forEach((cellText, cellIndex) => {
      const lines = wrappedCells[cellIndex];
      lines.forEach((lineText, lineIdx) => {
        pdf.text(lineText, cellX + 3, currentY + 4.5 + lineIdx * 4);
      });
      cellX += colWidths[cellIndex];
    });

    currentY += dynamicRowHeight;
  });

  return currentY;
};

/**
 * Renders a vector-based linear progress bar.
 */
const drawVectorProgressBar = (pdf, x, y, width, height, progress) => {
  const percentVal = Math.min(100, Math.max(0, progress));
  
  // Track (Slate-200)
  pdf.setFillColor(226, 232, 240);
  pdf.rect(x, y, width, height, "F");
  
  // Fill (Primary Blue)
  if (percentVal > 0) {
    pdf.setFillColor(37, 99, 235);
    pdf.rect(x, y, width * (percentVal / 100), height, "F");
  }
};

/**
 * Main Report Generator V2 (High Density, Modular Consulting Layout)
 */
export const exportReportToPdf = async (reportType = "weekly", currentUser = {}, userData = {}) => {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Extract raw lists
    const skills = userData.skills || [];
    const projects = userData.projects || [];
    const roadmap = userData.roadmap || {};
    const learningItems = userData.learning?.items || [];
    const reviews = userData.reviews || [];
    const portfolioGoals = userData.portfolioGoals || [];

    // Computations
    const weeklyStats = computeWeeklyReport(userData);
    const monthlyStats = computeMonthlyReport(userData);
    const activeStats = reportType === "weekly" ? weeklyStats : monthlyStats;

    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const activeProjects = projects.filter((p) => p.status !== "Completed").length;
    const totalStudyHours = learningItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
    
    const readiness = computePMReadinessScore(skills);
    const readinessLevel = getReadinessTier(readiness.overall);

    const roadmapStats = computeRoadmapMetrics(roadmap);
    const roadmapCompletedCount = roadmapStats.completedSubTopics;
    const roadmapAverageProgress = roadmapStats.overallCompletionPct;
    const totalRoadmapTopicsCount = roadmapStats.totalSubTopics;

    // Top Skill
    const sortedSkills = [...skills].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const topSkill = sortedSkills.length > 0 ? sortedSkills[0].name : "General PM";
    const lowestSkill = sortedSkills.length > 1 ? sortedSkills[sortedSkills.length - 1] : null;

    // Dates
    const dateRangeLabel = reportType === "weekly" ? getWeekRange() : getMonthRange();
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // ==========================================
    // 1. INSIGHT ENGINE (Automated & Analytical)
    // ==========================================
    const insights = [];
    
    // Insight 1: Learning commitment
    const hoursDiff = activeStats.studyTarget - totalStudyHours;
    if (hoursDiff > 0) {
      insights.push(`Weekly study hours are below target by ${hoursDiff} hours.`);
    } else {
      insights.push(`Weekly study target successfully achieved (exceeded by ${Math.abs(hoursDiff)} hours).`);
    }

    // Insight 2: Skill completion
    if (sortedSkills.length > 0) {
      insights.push(`${topSkill} currently has the highest skill level at ${sortedSkills[0].progress}% (${sortedSkills[0].level}).`);
    } else {
      insights.push("No candidate skills recorded in database competency matrix.");
    }

    // Insight 3: Roadmap status
    if (totalRoadmapTopicsCount > 0) {
      if (roadmapAverageProgress <= 25) {
        insights.push(`Roadmap progress remains in the early stage (${roadmapAverageProgress}% average progress).`);
      } else {
        insights.push(`Roadmap progress shows steady mid-stage development (${roadmapAverageProgress}% average progress).`);
      }
    } else {
      insights.push("Roadmap curriculum modules are not yet initialized.");
    }

    // Insight 4: Reflections
    if (reviews.length === 0) {
      insights.push("No weekly reflection logs have been submitted.");
    } else {
      insights.push("Weekly reflections are regularly submitted and tracked.");
    }

    // Insight 5: Project status
    if (projects.length > 0) {
      const completionRate = Math.round((completedProjects / projects.length) * 100);
      insights.push(`Project completion rate is currently ${completionRate}% (${completedProjects} of ${projects.length} completed).`);
    } else {
      insights.push("No active portfolio projects logged in dashboard.");
    }

    // ==========================================
    // 2. RECOMMENDATION ENGINE (Next Actions)
    // ==========================================
    const recommendations = [];
    if (hoursDiff > 0) {
      recommendations.push(`Increase weekly study dedication by ${hoursDiff}h to hit target.`);
    }
    if (roadmapAverageProgress < 80) {
      recommendations.push("Complete outstanding roadmap categories to progress PM syllabus.");
    }
    if (reviews.length === 0) {
      recommendations.push("Submit a weekly reflection to identify blocker areas.");
    }
    if (lowestSkill && lowestSkill.progress < 50) {
      recommendations.push(`Focus on improving competence in lowest skill "${lowestSkill.name}" (currently ${lowestSkill.progress}%).`);
    }
    if (projects.length === 0) {
      recommendations.push("Add a new portfolio project to demonstrate execution skills.");
    }
    // Default fallback recommendation
    if (recommendations.length === 0) {
      recommendations.push("Continue maintaining consistent weekly learning hours and logging projects.");
    }

    // ==========================================
    // 3. INITIALIZE PDF (A4 Portrait, Margins 18mm)
    // ==========================================
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.setProperties({
      title: "PM Career OS Report",
      author: "PM Career OS",
      subject: "Personal Growth Analytics",
      keywords: "PM, Learning, Career, Analytics",
    });

    const pageHeight = 297;
    const pageWidth = 210;
    const margin = 18;
    const usableWidth = pageWidth - 2 * margin; // 174mm
    const contentStartY = 28;
    const contentEndYLimit = 265;

    let currentY = contentStartY;
    let pageNum = 1;

    // Running Header / Footer helpers
    const drawHeader = (doc) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("PM CAREER OS PERFORMANCE REPORT", margin, 12);
      doc.setFont("helvetica", "normal");
      doc.text(dateRangeLabel.toUpperCase(), pageWidth - margin, 12, { align: "right" });

      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);
    };

    const drawRunningFooter = (doc, pIdx, totalP) => {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Generated by PM Career OS | Version: V1.1 | Date: ${dateStr}`, margin, pageHeight - 9);
      doc.text(`Page ${pIdx} of ${totalP}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    };

    const checkSpace = (heightNeeded) => {
      if (currentY + heightNeeded > contentEndYLimit) {
        pdf.addPage();
        pageNum += 1;
        drawHeader(pdf);
        currentY = contentStartY;
      }
    };

    // ==========================================
    // PAGE 1: HIGH-DENSITY EXECUTIVE BRIEF
    // ==========================================
    
    // Top Cover Block (Modern Compact Banner)
    pdf.setFillColor(248, 250, 252); // Slate-50
    pdf.rect(margin, 15, usableWidth, 38, "F");

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, 15, usableWidth, 38, "D");

    // Banner Left Vertical Stripe
    pdf.setFillColor(37, 99, 235);
    pdf.rect(margin, 15, 3, 38, "F");

    // Title & Range Label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(37, 99, 235);
    pdf.text("PM CAREER OS REPORT", margin + 8, 26);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139); // Slate-500
    pdf.text(`PERIOD: ${dateRangeLabel.toUpperCase()}`, margin + 8, 33);
    pdf.text(`ISSUED: ${dateStr}`, margin + 8, 39);

    // Candidate Details right side of banner
    const detailsX = pageWidth - margin - 75;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text("CANDIDATE PROFILE", detailsX, 23);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`Name:   ${currentUser?.name || "PM Candidate"}`, detailsX, 29);
    pdf.text(`Role:   ${currentUser?.targetRole || "Associate Product Manager"}`, detailsX, 34);
    pdf.text(`Goal:   ${currentUser?.careerGoal || "Product Leadership"}`, detailsX, 39);

    currentY = 62;

    // 1. EXECUTIVE SUMMARY
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(37, 99, 235);
    pdf.text("EXECUTIVE SUMMARY", margin, currentY);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    // Visual breathing: Spacing before and after dividers
    pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
    
    // Section title: 8mm below (Content starts at y = currentY + 10.5)
    currentY += 10.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    const summaryIntro = `This professional report reviews the skill matrices, project delivery milestones, and structured syllabus progression logged in the PM Career OS client workspace. Overall statistics have been parsed to verify target study hours and compute a quantitative readiness benchmark.`;
    // Slightly larger line heights for paragraphs (5.5mm step)
    const introLines = pdf.splitTextToSize(summaryIntro, usableWidth);
    introLines.forEach((line) => {
      pdf.text(line, margin, currentY);
      currentY += 5.5;
    });
    
    // Page sections: 11mm separation between content blocks
    currentY += 11;

    // 2. KEY INSIGHTS (Analytical & dynamic)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(37, 99, 235);
    pdf.text("KEY INSIGHTS", margin, currentY);
    pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
    currentY += 10.5; // 8mm below section title

    insights.forEach((insight) => {
      pdf.setFillColor(37, 99, 235); // Blue dot bullet
      pdf.circle(margin + 2, currentY - 1, 0.8, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(insight, margin + 6, currentY);
      // Insight items: 3.5mm vertical spacing (approx 6.3mm step)
      currentY += 6.3;
    });
    currentY += 11;

    // 3. ACTIONS & RECOMMENDATIONS
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(37, 99, 235);
    pdf.text("NEXT ACTIONS & RECOMMENDATIONS", margin, currentY);
    pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
    currentY += 10.5; // 8mm below section title

    recommendations.forEach((rec) => {
      pdf.setFillColor(245, 158, 11); // Amber accent bullet
      pdf.circle(margin + 2, currentY - 1, 0.8, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(rec, margin + 6, currentY);
      // Recommendations: 4.5mm spacing (approx 7.3mm step)
      currentY += 7.3;
    });
    currentY += 11;

    // 4. EXECUTIVE DASHBOARD METRICS
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(37, 99, 235);
    pdf.text("EXECUTIVE DASHBOARD METRICS", margin, currentY);
    pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
    currentY += 10.5; // 8mm below section title

    const metricsList = [
      { key: "Weighted Goals Completion Percentage", val: `${weeklyStats.goalCompletionPercentage}%` },
      { key: "Total Hours Logged in Curriculum", val: `${totalStudyHours} hours` },
      { key: "Curriculum Weekly Goal Commitment", val: `${activeStats.studyTarget} hours` },
      { key: "Active/In-Progress Projects", val: `${activeProjects} projects` },
      { key: "Completed Projects", val: `${completedProjects} projects` },
      { key: "PM Readiness Index Score", val: `${readiness.overall}% (${readinessLevel})` },
    ];

    metricsList.forEach((m) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(m.key, margin, currentY);
      
      const dotsWidth = usableWidth - pdf.getTextWidth(m.key) - pdf.getTextWidth(m.val) - 4;
      let dotStr = "";
      if (dotsWidth > 0) {
        dotStr = ".".repeat(Math.floor(dotsWidth / 1.1));
      }

      pdf.setTextColor(148, 163, 184);
      pdf.text(dotStr, margin + pdf.getTextWidth(m.key) + 2, currentY);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.text(m.val, pageWidth - margin, currentY, { align: "right" });
      currentY += 7.5; // Breathable metric lines
    });

    // ==========================================
    // MODULE REGISTRY FOR REPORT PAGES (Flowing)
    // ==========================================
    const renderLearningModule = async () => {
      checkSpace(40);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text("2. LEARNING STATISTICS", margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5; // 8mm below section title

      if (learningItems.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No learning activity recorded.", margin, currentY);
        currentY += 10;
      } else {
        const headers = ["Course / Learning Module", "Curriculum Type", "Hours Logged", "Completion Rate"];
        const colWidths = [84, 35, 25, 30];
        const rows = learningItems.map((item) => [
          item.title || "Untitled Course",
          item.type || "Course",
          `${item.timeSpent || 0}h`,
          `${item.completion || 0}%`,
        ]);

        // Tables: 5mm above and below
        currentY = drawPdfTable(pdf, headers, rows, margin, currentY, colWidths);
        currentY += 5;
      }

      // Conditional chart rendering: threshold >= 3 items
      if (learningItems.length >= 3) {
        checkSpace(60);
        const chartImg = await captureChartImage(html2canvas, "print-study-bar-chart");
        if (chartImg) {
          pdf.addImage(chartImg, "PNG", margin + 35, currentY, 100, 48, undefined, "FAST");
          currentY += 56;
        } else {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text("Insufficient data for visualization.", margin, currentY);
          currentY += 8;
        }
      }
    };

    const renderProjectsModule = async () => {
      checkSpace(40);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text("3. PROJECTS OVERVIEW", margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5; // 8mm below section title

      if (projects.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No project data available for visualization.", margin, currentY);
        currentY += 10;
      } else {
        const headers = ["Project Title", "Current Status", "Priority Tier", "Progress"];
        const colWidths = [84, 30, 30, 30];
        const rows = projects.map((p) => [
          p.title || "Untitled Project",
          p.status || "In Progress",
          p.priority || "Medium",
          `${p.progress || 0}%`,
        ]);

        currentY = drawPdfTable(pdf, headers, rows, margin, currentY, colWidths);
        currentY += 5;
      }

      // Render chart if there are projects
      if (projects.length > 0) {
        checkSpace(68);
        const chartImg = await captureChartImage(html2canvas, "print-project-pie-chart");
        if (chartImg) {
          pdf.addImage(chartImg, "PNG", margin + 35, currentY, 100, 48, undefined, "FAST");
          currentY += 50;

          // Render proper centered vector legend below the chart
          const todo = projects.filter((p) => p.status === "To Do").length;
          const inProgress = projects.filter((p) => p.status === "In Progress").length;
          const completed = projects.filter((p) => p.status === "Completed").length;
          const total = todo + inProgress + completed;

          const todoPct = total > 0 ? Math.round((todo / total) * 100) : 0;
          const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
          const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

          const legendItems = [
            { label: `To Do: ${todo} (${todoPct}%)`, color: [96, 165, 250] },
            { label: `In Progress: ${inProgress} (${inProgressPct}%)`, color: [37, 99, 235] },
            { label: `Completed: ${completed} (${completedPct}%)`, color: [16, 185, 129] },
          ];

          // Calculate total text width for centering
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          
          let totalWidth = 0;
          const spacing = 10; // spacing between items in mm
          const bulletRadius = 1.2;
          const bulletTextGap = 2.5;

          const itemWidths = legendItems.map(item => {
            return (bulletRadius * 2) + bulletTextGap + pdf.getTextWidth(item.label);
          });

          totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + (legendItems.length - 1) * spacing;
          
          let startX = margin + (usableWidth - totalWidth) / 2;

          legendItems.forEach((item, idx) => {
            // Draw bullet
            pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
            pdf.circle(startX + bulletRadius, currentY - 0.8, bulletRadius, "F");

            // Draw label
            pdf.setTextColor(71, 85, 105); // Slate-600
            pdf.text(item.label, startX + (bulletRadius * 2) + bulletTextGap, currentY);

            // Increment startX for next item
            startX += itemWidths[idx] + spacing;
          });

          currentY += 12; // Breathing space after legend
        } else {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text("Insufficient data for visualization.", margin, currentY);
          currentY += 8;
        }
      }
    };

    const renderSkillsModule = async () => {
      checkSpace(45);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text("4. SKILLS & COMPETENCIES", margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5; // 8mm below section title

      if (skills.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No skills recorded.", margin, currentY);
        currentY += 10;
      } else {
        // High density table with progress bars
        const headers = ["Skill Competency", "Tier Level", "Index Progress"];
        const colWidths = [84, 40, 50];
        
        // Custom rows formatting - progress index cell will have bar drawn
        const rows = skills.map((s) => [
          s.name || "Skill",
          s.level || "Beginner",
          "", // Left blank for drawing bars
        ]);

        const startYTable = currentY;
        currentY = drawPdfTable(pdf, headers, rows, margin, startYTable, colWidths);

        // Draw bars over blank cells retrospectively with 4.5mm visual breathing space
        let barYOffset = startYTable + 7.5 + 2;
        skills.forEach((s) => {
          drawVectorProgressBar(pdf, margin + 84 + 40 + 3, barYOffset + 1.2, 35, 2.2, s.progress || 0);
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(37, 99, 235);
          pdf.text(`${s.progress || 0}%`, margin + 84 + 40 + 40, barYOffset + 3);

          barYOffset += 8; // Breathable vertical padding between rows
        });
        
        currentY += 5;
      }

      // Conditional chart rendering: threshold >= 4 skills
      if (skills.length >= 4) {
        checkSpace(60);
        const chartImg = await captureChartImage(html2canvas, "print-radar-chart");
        if (chartImg) {
          pdf.addImage(chartImg, "PNG", margin + 35, currentY, 100, 48, undefined, "FAST");
          currentY += 56;
        } else {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text("Insufficient data for visualization.", margin, currentY);
          currentY += 8;
        }
      }
    };

    const renderRoadmapModule = async () => {
      checkSpace(40);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text("5. ROADMAP COMPLETION", margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5; // 8mm below section title

      const roadmapCategories = roadmapStats.perCategory;
      if (roadmapCategories.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No roadmap progress recorded.", margin, currentY);
        currentY += 10;
      } else {
        // Detailed Roadmap Logic formatting
        const headers = ["Syllabus Category", "Topics (Completed / Active)", "Progress & Status"];
        const colWidths = [84, 50, 40];
        
        const rows = roadmapCategories.map((cat) => {
          const completedCount = cat.completed;
          const activeCount = cat.total - cat.completed;
          const averageProgress = cat.completionPct;

          // Status calculations
          let statusText = `${averageProgress}%`;
          if (averageProgress > 0 && completedCount === 0) {
            statusText = `${averageProgress}% (In Progress)`;
          } else if (completedCount === cat.total && cat.total > 0) {
            statusText = "Completed";
          }

          return [
            cat.name,
            `${completedCount} / ${cat.total} (${activeCount} Active)`,
            statusText,
          ];
        });

        currentY = drawPdfTable(pdf, headers, rows, margin, currentY, colWidths);
        currentY += 5;
      }

      // Conditional chart rendering: threshold >= 5 topics
      if (totalRoadmapTopicsCount >= 5) {
        checkSpace(60);
        const chartImg = await captureChartImage(html2canvas, "print-roadmap-bar-chart");
        if (chartImg) {
          pdf.addImage(chartImg, "PNG", margin + 35, currentY, 100, 48, undefined, "FAST");
          currentY += 56;
        } else {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text("Insufficient data for visualization.", margin, currentY);
          currentY += 8;
        }
      }
    };

    const renderPortfolioModule = async () => {
      checkSpace(40);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text("6. PORTFOLIO GOALS", margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5; // 8mm below section title

      if (portfolioGoals.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No portfolio goals created.", margin, currentY);
        currentY += 10;
      } else {
        const headers = ["Goal Title", "Target Milestone Description", "Completion", "Target Deadline"];
        const colWidths = [60, 64, 25, 25];
        const rows = portfolioGoals.map((g) => [
          g.title || "Goal Title",
          g.milestone || g.description || "None",
          `${g.progress || 0}%`,
          formatShortDate(g.deadline || g.target_date),
        ]);

        currentY = drawPdfTable(pdf, headers, rows, margin, currentY, colWidths);
        currentY += 5;
      }
    };

    const renderReviewsModule = async () => {
      checkSpace(35);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`7. WEEKLY REFLECTIONS & REVIEWS (Total: ${reviews.length})`, margin, currentY);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);
      currentY += 10.5;

      const recentReviews = reviews.length > 0
        ? [...reviews].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)).slice(0, 2)
        : [];

      if (recentReviews.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text("No weekly reflections submitted.", margin, currentY);
        currentY += 10;
      } else {
        recentReviews.forEach((review) => {
          const contentSections = formatReviewReflection(review)
            .map((item) => item.value ? `${item.label}: ${item.value}` : "")
            .filter(Boolean);
          
          const refText = contentSections.length > 0 ? contentSections.join("\n\n") : "No detailed reflection entered.";
          const refLines = pdf.splitTextToSize(refText, usableWidth - 10);
          
          const textHeight = refLines.length * 4.5;
          const blockHeight = textHeight + 14;

          checkSpace(blockHeight + 5);

          // Blockquote box
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, currentY, usableWidth, blockHeight, "F");

          // Left blue border line
          pdf.setFillColor(37, 99, 235);
          pdf.rect(margin, currentY, 1.2, blockHeight, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          pdf.setTextColor(71, 85, 105);
          pdf.text(`Review Logged: ${formatDate(review.date || review.created_at)}`, margin + 5, currentY + 5);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(15, 23, 42);
          
          refLines.forEach((line, idx) => {
            pdf.text(line, margin + 5, currentY + 11 + idx * 4.5);
          });

          currentY += blockHeight + 5;
        });
      }
    };

    // ==========================================
    // SEQUENTIAL EXECUTION OF DETAILED MODULES
    // ==========================================
    // Page 2 start
    pdf.addPage();
    pageNum += 1;
    drawHeader(pdf);
    currentY = contentStartY;

    await renderLearningModule();
    currentY += 12; // Page sections: 10-12mm separation
    
    await renderProjectsModule();
    currentY += 12;
    
    await renderSkillsModule();
    currentY += 12;
    
    await renderRoadmapModule();
    currentY += 12;
    
    await renderPortfolioModule();
    currentY += 12;
    
    await renderReviewsModule();

    // ==========================================
    // TWO-PASS PAGINATION: DRAW FOOTERS RETROSPECTIVELY
    // ==========================================
    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 2; p <= totalPages; p++) {
      pdf.setPage(p);
      drawRunningFooter(pdf, p, totalPages);
    }

    // Save report
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, "0");
    const DD = String(today.getDate()).padStart(2, "0");

    let filename = "";
    if (reportType === "weekly") {
      filename = `Weekly_Report_${YYYY}_${MM}_${DD}.pdf`;
    } else {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthLabel = monthNames[today.getMonth()];
      filename = `PM_Report_${monthLabel}_${YYYY}.pdf`;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF Native Export V2 failed:", error);
    throw error;
  }
};
