import os

colors = {
    "terracotta": "#C4704B",
    "sage": "#7D8B6E",
    "charcoal": "#2D2A26",
    "cream_dark": "#D98B6A",
    "cream_light": "#F0E9DC"
}

icons = {
    "vision.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z" fill="{colors['terracotta']}" />
  <circle cx="16" cy="16" r="4" fill="{colors['cream_light']}" />
  <path d="M22 6L23 9L26 10L23 11L22 14L21 11L18 10L21 9L22 6Z" fill="{colors['sage']}" />
</svg>''',

    "interface.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="2" width="20" height="28" rx="3" fill="{colors['charcoal']}" />
  <rect x="8" y="4" width="16" height="20" rx="1" fill="{colors['cream_light']}" />
  <circle cx="16" cy="27" r="2" fill="{colors['terracotta']}" />
  <rect x="10" y="8" width="12" height="2" rx="1" fill="{colors['sage']}" opacity="0.5" />
  <rect x="10" y="12" width="8" height="2" rx="1" fill="{colors['sage']}" opacity="0.5" />
</svg>''',

    "built.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="14" width="10" height="14" rx="2" fill="{colors['sage']}" />
  <rect x="18" y="8" width="10" height="20" rx="2" fill="{colors['terracotta']}" />
  <rect x="8" y="4" width="20" height="4" rx="2" fill="{colors['charcoal']}" />
  <circle cx="9" cy="20" r="2" fill="{colors['cream_light']}" opacity="0.5" />
  <circle cx="23" cy="14" r="2" fill="{colors['cream_light']}" opacity="0.5" />
</svg>''',

    "capabilities.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="10" stroke="{colors['terracotta']}" stroke-width="3" />
  <rect x="18" y="18" width="10" height="4" rx="2" transform="rotate(45 18 18)" fill="{colors['charcoal']}" />
  <circle cx="14" cy="14" r="4" fill="{colors['sage']}" />
</svg>''',

    "deploy.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2C16 2 8 16 8 22C8 26.4183 11.5817 30 16 30C20.4183 30 24 26.4183 24 22C24 16 16 2 16 2Z" fill="{colors['terracotta']}" />
  <circle cx="16" cy="20" r="4" fill="{colors['cream_light']}" />
  <path d="M4 22L8 22" stroke="{colors['charcoal']}" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 22L28 22" stroke="{colors['charcoal']}" stroke-width="2" stroke-linecap="round"/>
  <path d="M16 30L16 32" stroke="{colors['charcoal']}" stroke-width="2" stroke-linecap="round"/>
</svg>''',

    "security.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L4 7V14C4 21.5 9.2 28.4 16 30C22.8 28.4 28 21.5 28 14V7L16 2Z" fill="{colors['sage']}" />
  <path d="M16 10V20" stroke="{colors['cream_light']}" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 15H20" stroke="{colors['cream_light']}" stroke-width="3" stroke-linecap="round"/>
</svg>''',

    "contribute.svg": f'''
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 28S28 21 28 13C28 8.5 24.5 5 20 5C17.5 5 16 7 16 7C16 7 14.5 5 12 5C7.5 5 4 8.5 4 13C4 21 16 28 16 28Z" fill="{colors['terracotta']}" />
  <path d="M8 13C8 13 10 13 12 15" stroke="{colors['cream_light']}" stroke-width="2" stroke-linecap="round"/>
</svg>'''
}

for name, content in icons.items():
    with open(f"doc_assets/{name}", "w") as f:
        f.write(content.strip())
        print(f"Created {name}")
