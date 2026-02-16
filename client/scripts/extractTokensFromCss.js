/**
 * Extract Design Tokens from globals.css (Figma export)
 * Generates tokens.json for Tailwind configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the globals.css from Desktop (user's Figma export)
const globalsPath = 'C:\\Users\\noobr\\Desktop\\globals.css';
const outputPath = path.join(__dirname, '..', 'src', 'theme', 'tokens.json');

try {
  const css = fs.readFileSync(globalsPath, 'utf8');
  
  const tokens = {
    colors: {},
    spacing: {},
    borderRadius: {},
    fontFamily: {},
    fontSize: {},
    fontWeight: {}
  };

  // Extract :root CSS variables
  const rootMatch = css.match(/:root\s*{([^}]+)}/);
  if (rootMatch) {
    const vars = rootMatch[1];
    
    // Extract colors
    const colorMatches = vars.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6}|oklch\([^)]+\)|rgba?\([^)]+\));/g);
    for (const match of colorMatches) {
      const [, name, value] = match;
      tokens.colors[name] = value;
    }
    
    // Extract font sizes
    const fontSizeMatch = vars.match(/--font-size:\s*([^;]+);/);
    if (fontSizeMatch) {
      tokens.fontSize.base = fontSizeMatch[1].trim();
    }
    
    // Extract border radius
    const radiusMatch = vars.match(/--radius:\s*([^;]+);/);
    if (radiusMatch) {
      tokens.borderRadius.DEFAULT = radiusMatch[1].trim();
    }
    
    // Extract font weights
    const weightMatches = vars.matchAll(/--font-weight-([a-z]+):\s*([^;]+);/g);
    for (const match of weightMatches) {
      const [, name, value] = match;
      tokens.fontWeight[name] = value.trim();
    }
  }

  // Extract .dark CSS variables
  const darkMatch = css.match(/\.dark\s*{([^}]+)}/);
  if (darkMatch) {
    const vars = darkMatch[1];
    const colorMatches = vars.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6}|oklch\([^)]+\)|rgba?\([^)]+\));/g);
    for (const match of colorMatches) {
      const [, name, value] = match;
      tokens.colors[`${name}-dark`] = value;
    }
  }

  // Create theme directory if it doesn't exist
  const themeDir = path.join(__dirname, '..', 'src', 'theme');
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }

  // Write tokens.json
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  
  console.log('✅ Design tokens extracted successfully!');
  console.log(`📝 Output: ${outputPath}`);
  console.log(`🎨 Colors: ${Object.keys(tokens.colors).length}`);
  console.log(`📏 Spacing: ${Object.keys(tokens.spacing).length}`);
  console.log(`🔤 Font weights: ${Object.keys(tokens.fontWeight).length}`);
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ Error: globals.css not found at', globalsPath);
    console.error('Please ensure the Figma export is placed at C:\\Users\\noobr\\Desktop\\globals.css');
  } else {
    console.error('❌ Error extracting tokens:', error.message);
  }
  process.exit(1);
}
