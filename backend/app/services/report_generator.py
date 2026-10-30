import io
from datetime import datetime, timezone
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(prediction_data: Dict[str, Any]) -> io.BytesIO:
    """
    Generates a formal academic and agronomic PDF diagnosis report for a prediction record.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#14532d"), # Forest green
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )
    heading2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#166534"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )
    bullet_style = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        spaceAfter=3
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Italic"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#991b1b")
    )

    elements = []

    # Header
    elements.append(Paragraph("CROP DISEASE DIAGNOSIS REPORT", title_style))
    elements.append(Paragraph("AI-Assisted Foliar Pathology Analysis & Management Summary", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#15803d"), spaceAfter=15))

    # Meta Table
    prediction_id = prediction_data.get("id") or prediction_data.get("prediction_id", "N/A")
    created_at = prediction_data.get("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    model_version = prediction_data.get("model_version") or prediction_data.get("model_name", "MobileNetV2")
    inf_time = prediction_data.get("inference_time_ms", 0.0)

    meta_data = [
        [Paragraph("<b>Report ID:</b>", body_style), Paragraph(str(prediction_id), body_style),
         Paragraph("<b>Date & Time:</b>", body_style), Paragraph(str(created_at), body_style)],
        [Paragraph("<b>Model Architecture:</b>", body_style), Paragraph(str(model_version), body_style),
         Paragraph("<b>Inference Latency:</b>", body_style), Paragraph(f"{inf_time} ms", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[100, 160, 90, 180])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # Primary Diagnosis Table
    elements.append(Paragraph("Primary Classification Result", heading2_style))
    crop_name = prediction_data.get("crop_name", "Unknown")
    disease_name = prediction_data.get("disease_name", "Unknown")
    pred_class = prediction_data.get("predicted_class", "Unknown")
    confidence = prediction_data.get("confidence", 0.0)
    conf_pct = f"{confidence * 100:.1f}%" if confidence <= 1.0 else f"{confidence:.1f}%"
    is_healthy = prediction_data.get("is_healthy", "healthy" in pred_class.lower())
    status_label = "HEALTHY TISSUE" if is_healthy else "PATHOLOGY DETECTED"
    status_color = "#15803d" if is_healthy else "#dc2626"

    diag_data = [
        [Paragraph("<b>Host Crop:</b>", body_style), Paragraph(f"<b>{crop_name}</b>", body_style)],
        [Paragraph("<b>Identified Condition:</b>", body_style), Paragraph(f"<b>{disease_name}</b> ({pred_class})", body_style)],
        [Paragraph("<b>Diagnostic Confidence:</b>", body_style), Paragraph(f"<b>{conf_pct}</b>", body_style)],
        [Paragraph("<b>Pathology Status:</b>", body_style), Paragraph(f"<font color='{status_color}'><b>{status_label}</b></font>", body_style)],
    ]
    diag_table = Table(diag_data, colWidths=[150, 380])
    diag_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4") if is_healthy else colors.HexColor("#fef2f2")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#86efac") if is_healthy else colors.HexColor("#fca5a5")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(diag_table)
    elements.append(Spacer(1, 14))

    # Top Predictions Breakdown
    top_preds = prediction_data.get("top_predictions", [])
    if top_preds:
        elements.append(Paragraph("Alternative Hypotheses (Top-5 Class Distribution)", heading2_style))
        table_rows = [[
            Paragraph("<b>Rank</b>", body_style),
            Paragraph("<b>Crop & Disease</b>", body_style),
            Paragraph("<b>Class Label</b>", body_style),
            Paragraph("<b>Confidence</b>", body_style)
        ]]
        for idx, item in enumerate(top_preds[:5], 1):
            if isinstance(item, dict):
                c_crop = item.get("crop_name", "N/A")
                c_dis = item.get("disease_name", "N/A")
                c_raw = item.get("class_name", item.get("predicted_class", "N/A"))
                c_conf = item.get("confidence", 0.0)
                conf_str = f"{c_conf*100:.1f}%" if c_conf <= 1.0 else f"{c_conf:.1f}%"
                table_rows.append([
                    Paragraph(f"#{idx}", body_style),
                    Paragraph(f"{c_crop} - {c_dis}", body_style),
                    Paragraph(c_raw, body_style),
                    Paragraph(conf_str, body_style)
                ])
        alt_table = Table(table_rows, colWidths=[40, 200, 210, 80])
        alt_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(alt_table)
        elements.append(Spacer(1, 14))

    # Symptoms and Management Guidance
    guidance = prediction_data.get("guidance", {})
    if guidance:
        symptoms = guidance.get("symptoms", [])
        if symptoms:
            elements.append(Paragraph("Documented Visible Symptoms", heading2_style))
            for s in symptoms:
                elements.append(Paragraph(f"• {s}", bullet_style))
            elements.append(Spacer(1, 6))

        prevention = guidance.get("prevention", [])
        if prevention:
            elements.append(Paragraph("Preventive Cultural Practices", heading2_style))
            for p in prevention:
                elements.append(Paragraph(f"• {p}", bullet_style))
            elements.append(Spacer(1, 6))

        mgmt = guidance.get("management", [])
        if mgmt:
            elements.append(Paragraph("Integrated Management Recommendations", heading2_style))
            for m in mgmt:
                elements.append(Paragraph(f"• {m}", bullet_style))
            elements.append(Spacer(1, 6))

        refs = guidance.get("references", [])
        if refs:
            elements.append(Paragraph("Reference Sources & Citations", heading2_style))
            for r in refs:
                elements.append(Paragraph(f"• {r}", bullet_style))
            elements.append(Spacer(1, 10))

    # Disclaimer Box
    elements.append(Spacer(1, 10))
    disclaimer_text = (
        "<b>ACADEMIC & PRELIMINARY DIAGNOSIS DISCLAIMER:</b><br/>"
        "This report was automatically synthesized by a deep convolutional neural network (MobileNetV2 transfer learning). "
        "Predictions are strictly preliminary diagnostic aids and DO NOT constitute legal, clinical, or commercial agricultural certifications. "
        "Foliar symptomology can overlap between biotic infections (fungi, bacteria, viruses) and abiotic stresses (nutrient deficiencies, herbicide drift, heat stress). "
        "Always confirm critical crop treatment decisions with a certified agricultural extension specialist or local agronomy laboratory before applying chemical treatments."
    )
    disclaimer_box = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[530])
    disclaimer_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff1f2")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#fecdd3")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(KeepTogether([disclaimer_box]))

    doc.build(elements)
    buffer.seek(0)
    return buffer
