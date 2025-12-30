import re

print("Reading research_body.html...")
with open('research_body.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Counter for h4
h4_counter = 0

pattern = re.compile(r'(<h[123][^>]*>.*?</h[123]>)|(<h4([^>]*)>(.*?)</h4>)', re.DOTALL)

def callback(match):
    global h4_counter
    if match.group(1): # It's an H1, H2, or H3
        # Reset counter when we hit a higher level header
        # Note: Sometimes H3 is used for grouping, but usually H4 is the list item.
        # If H3 is present, should we reset? 
        # In the previous content, H4 was used for numbered lists under H2.
        # Let's assume H1/H2/H3 all reset the H4 counter.
        h4_counter = 0
        return match.group(1)
    else: # It's an H4
        attrs = match.group(3)
        inner = match.group(4)
        
        # Remove existing number prefix if present (e.g., "1. ", "1，", "1、")
        clean_inner = re.sub(r'^\s*\d+[.,，、]\s*', '', inner)
        
        h4_counter += 1
        return f'<h4{attrs}>{h4_counter}. {clean_inner}</h4>'

new_content = pattern.sub(callback, content)

print("Writing fixed content back to research_body.html...")
with open('research_body.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done.")
