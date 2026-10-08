import os

def create_simple_pdf(filename, title, subtitle, author="E-Book Shop Digital Publication"):
    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 280 >>
stream
BT
/F1 28 Tf
50 700 Td
({title}) Tj
/F1 16 Tf
0 -40 Td
({subtitle}) Tj
/F1 12 Tf
0 -40 Td
(Published by: {author}) Tj
0 -30 Td
(Thank you for purchasing this Digital E-Book Product!) Tj
0 -20 Td
(Official Verification: PAID & LICENSED) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000556 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
634
%%EOF
"""
    with open(filename, "wb") as f:
        f.write(content.encode('latin1'))

out_dir = r"e:\Select_Topic_Project\shared\downloads"
os.makedirs(out_dir, exist_ok=True)

books = [
    ("life-better-start-from-us.pdf", "Better Life Starts From Within", "E-Book: Self Development & Happiness"),
    ("work-efficiency-guide.pdf", "Work Efficiency & High Performance", "E-Book: Productivity Masterclass"),
    ("health-starts-from-mind.pdf", "Good Health Begins With The Mind", "E-Book: Physical and Mental Wellness"),
    ("art-of-living.pdf", "The Art of Mindful Living", "E-Book: Peace, Mindfulness, and Joy"),
]

for fname, title, subtitle in books:
    create_simple_pdf(os.path.join(out_dir, fname), title, subtitle)

# create zip mock files
import zipfile
for zname in ["notion-life-os-2026.zip", "3d-glassmorphism-icons.zip"]:
    zpath = os.path.join(out_dir, zname)
    with zipfile.ZipFile(zpath, 'w') as zf:
        zf.writestr("README.txt", f"Thank you for purchasing {zname}! Digital Product delivery successful.")

print("Created sample digital products in", out_dir)
