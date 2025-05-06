import pandas as pd
import re

# Path to your markdown file
md_file = "TestData/Monday May 5th.md"
# Output Excel file
excel_file = "TestData/Monday May 5th.xlsx"

# Read the markdown file
with open(md_file, 'r') as f:
    md_content = f.read()

# Split the content into lines
lines = md_content.strip().split('\n')

# Remove the separator line (second line with dashes)
if '---' in lines[1]:
    lines.pop(1)

# Process each line to extract data
rows = []
for line in lines:
    # Skip empty lines
    if not line.strip():
        continue
    
    # Split by pipe and strip whitespace
    cells = [cell.strip() for cell in line.split('|')]
    
    # Remove empty cells at the beginning and end (from the table formatting)
    if cells and not cells[0]:
        cells.pop(0)
    if cells and not cells[-1]:
        cells.pop()
    
    # Extract email from markdown link format if present
    for i, cell in enumerate(cells):
        email_match = re.search(r'\[([^]]+)\]\(mailto:[^)]+\)', cell)
        if email_match:
            cells[i] = email_match.group(1)
    
    rows.append(cells)

# Create DataFrame
if rows:
    headers = rows[0]
    data = rows[1:]
    df = pd.DataFrame(data, columns=headers)
    
    # Save to Excel
    df.to_excel(excel_file, index=False)
    print(f"Successfully converted {md_file} to {excel_file}")
else:
    print("No data found in the markdown file")