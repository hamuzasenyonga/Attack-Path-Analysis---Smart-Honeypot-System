// CSV Parser utility for reading CSV files from the public directory
export async function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle CSV parsing with proper quote handling
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Try to parse as number if it looks like one
      if (!isNaN(value) && value !== '' && value !== '') {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    });
    
    return obj;
  });
}

export async function fetchCSVData(filename) {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}`);
    }
    const csvText = await response.text();
    return await parseCSV(csvText);
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return [];
  }
}
