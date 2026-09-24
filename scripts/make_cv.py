"""Builds the CV PDF from facts in the LinkedIn export, GitHub and the papers.

Usage: python scripts/make_cv.py public/Ihya-Nashirudin-Abrar-CV.pdf  (needs reportlab)
"""
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable

OUT = sys.argv[1]
INK = colors.HexColor('#141413')
MUTED = colors.HexColor('#5f5f59')
ACCENT = colors.HexColor('#b8420f')
RULE = colors.HexColor('#d6d6ce')

name = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=INK)
role = ParagraphStyle('role', fontName='Helvetica', fontSize=11.5, leading=15, textColor=ACCENT, spaceBefore=2)
contact = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.8, leading=12.5, textColor=MUTED, spaceBefore=6)
h = ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=INK, spaceBefore=12, spaceAfter=3)
body = ParagraphStyle('body', fontName='Helvetica', fontSize=9.2, leading=12.8, textColor=INK)
small = ParagraphStyle('small', parent=body, fontSize=8.6, leading=12, textColor=MUTED)
title = ParagraphStyle('title', parent=body, fontName='Helvetica-Bold')
when = ParagraphStyle('when', parent=small, alignment=2)


def section(label):
    return [Paragraph(label, h), HRFlowable(width='100%', thickness=0.8, color=ACCENT, spaceBefore=0, spaceAfter=5)]


def entry(head, period, lines, sub=None):
    left = [Paragraph(head, title)]
    if sub:
        left.append(Paragraph(sub, small))
    left += [Paragraph(l, body) for l in lines]
    t = Table([[left, Paragraph(period, when)]], colWidths=[174 * mm - 12 - 42 * mm, 42 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 5), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
    return KeepTogether(t)


story = [
    Paragraph("Ihya' Nashirudin Abrar", name),
    Paragraph('Developer, data and AI', role),
    Paragraph('Pontianak, Indonesia &nbsp;·&nbsp; ihyakpati1144@gmail.com &nbsp;·&nbsp; linkedin.com/in/ihya-nashirudin-abrar-9978a6243'
              '<br/>github.com/ihyaabrar &nbsp;·&nbsp; ORCID 0009-0004-3993-3585', contact),
    Spacer(1, 4),
]

story += section('Profile')
story.append(Paragraph(
    'I build small, useful products and measure whether they work: web and mobile apps, browser extensions, and machine '
    'learning research on health data. I am in the third semester of the Master of Informatics at Universitas Ahmad Dahlan. '
    'Open to freelance projects, taken on at a relaxed pace while I focus on research.', body))

story += section('Experience')
story += [
    entry('Coding Teacher', 'Jul 2025 to Oct 2025', ['Taught programming fundamentals to young students with Scratch, Blockly and Python.'],
          'Kalananti by Ruangguru, Pontianak'),
    entry('IT Support', 'Jan 2024 to Oct 2025', ["Maintained the clinic's server and website, and designed content for its social media."],
          'Klinik Utama PKU Muhammadiyah Kitamura, Pontianak'),
    entry('Frontend Developer', 'Feb 2023 to Jul 2023', ['Built the web interface of appbjonlie.com with HTML, CSS and Bootstrap, working with the backend team.'],
          'Biro Logistik Polda Kalbar, Pontianak'),
    entry('Computer Lab Assistant', 'Feb 2022 to Aug 2022', ['Supported lecturers and guided students through practical sessions.'],
          'Universitas Muhammadiyah Pontianak'),
    entry('Layout Designer, then Advisor', 'Aug 2018 to Sep 2022', ['Laid out each issue of the magazine, then advised the editorial team on content (from Aug 2021).'],
          'Ukhuwah Magazine, Pati'),
    entry('Secretary, HM2IF', '2025/2026', ["Informatics master's student association."], 'Universitas Ahmad Dahlan'),
]

story += section('Education')
story += [
    entry('Master of Informatics', 'Oct 2025 to present', ['Research on machine learning for health data.'], 'Universitas Ahmad Dahlan'),
    entry('Bachelor of Informatics (Teknik Informatika)', 'Sep 2018 to Dec 2022', ['Thesis on liver disease classification with K-NN.'],
          'Universitas Muhammadiyah Pontianak'),
]

story += section('Publications')
story += [
    entry('Comparative Evaluation of Boosting Ensemble Models for Medication Adherence Prediction in Patients with Non-Communicable Diseases',
          'Jul 2026', ['Jurnal Sisfokom, Vol. 15 No. 3. With M. K. Biddinika and H. Yuliansyah. doi.org/10.32736/sisfokom.v15i3.2712'], None),
    entry('Frozen LLM-generated vs manual preprocessing for medical-claims adherence classification', 'Submitted',
          ['Submitted to IJEEEMI. Notebooks: github.com/ihyaabrar/llm-vs-manual-preprocessing'], None),
    entry('Liver Disease Classification Using the Elbow Method to Determine Optimal K in the K-Nearest Neighbor (K-NN) Algorithm',
          'Dec 2023', ['Jurnal Sisfokom.'], None),
]

story += section('Selected projects')
story += [
    entry('Gerai BKMT', 'Live', ['Point of sale, inventory, profit sharing and a public storefront for PD BKMT Kubu Raya. Next.js 14, Prisma. gerai-bkmt.vercel.app'], None),
    entry('MediCode', 'Browser extension', ['ICD-10 and ICD-9 lookup with INA-CBG tariff estimates for health workers. React, TypeScript, Dexie.'], None),
    entry('VisionPOS', 'Computer vision', ['A cashier that recognises products through the camera. FastAPI, React, YOLO.'], None),
    entry('Desktop AI Companion', 'Desktop app', ['Local-first companion that remembers you, sees your screen and talks back. Tauri 2, React.'], None),
    entry('CertGen', 'Web tool', ['Generates hundreds of certificates in the browser, with no backend. Next.js 15, Fabric.js, jsPDF.'], None),
]

story += section('Skills')
story += [
    Paragraph('<b>Web and mobile:</b> TypeScript, JavaScript, React, Next.js, Node.js, Tailwind, Capacitor, Tauri', body),
    Paragraph('<b>Data and AI:</b> Python, FastAPI, scikit-learn, LightGBM, SHAP, YOLO, Streamlit', body),
    Paragraph('<b>Databases and deployment:</b> Prisma, MySQL, Docker, Git, Vercel', body),
    Paragraph('<b>Languages:</b> Indonesian (native), English (limited working proficiency)', body),
]

story += section('Courses and certificates')
for c in ['Learning Data Analytics: 1 Foundations', 'Machine Learning with Python: Foundations',
          'Machine Learning with Python: Decision Trees', 'Introduction to Data Analysis using Microsoft Excel',
          'Introducing Robotic Process Automation']:
    story.append(Paragraph(c, body))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=16 * mm,
                        title="Ihya' Nashirudin Abrar, CV", author="Ihya' Nashirudin Abrar", subject='Curriculum vitae')
doc.build(story)
print('written', OUT)
