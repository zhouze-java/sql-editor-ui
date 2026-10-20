export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'ASC', 'DESC',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'DROP TABLE',
  'ALTER TABLE', 'ADD COLUMN', 'DROP COLUMN', 'DISTINCT', 'AS', 'UNION', 'UNION ALL',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'SHOW TABLES', 'DESCRIBE', 'EXPLAIN'
];

export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CONCAT', 'SUBSTRING', 'COALESCE',
  'DATE_FORMAT', 'NOW', 'CURRENT_TIMESTAMP', 'ROUND', 'IFNULL', 'LOWER', 'UPPER'
];

/**
 * Formats a raw SQL string into clean, readable indented SQL
 */
export function formatSql(rawSql: string): string {
  if (!rawSql || !rawSql.trim()) return '';

  let sql = rawSql.trim().replace(/\s+/g, ' ');

  // List of major keywords that should be uppercase
  const allKeywords = [...SQL_KEYWORDS, ...SQL_FUNCTIONS];
  allKeywords.sort((a, b) => b.length - a.length);

  // Replace keywords case-insensitively while preserving strings
  // Split by string literals first
  const stringTokens: string[] = [];
  sql = sql.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, (match) => {
    stringTokens.push(match);
    return `__STR_${stringTokens.length - 1}__`;
  });

  // Keyword uppercasing
  allKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    sql = sql.replace(regex, keyword.toUpperCase());
  });

  // Put newlines before major clauses
  const majorClauses = [
    'SELECT', 'FROM', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
    'WHERE', 'AND', 'OR', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'
  ];

  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\s+(${clause})\\b`, 'g');
    sql = sql.replace(regex, `\n$1`);
  });

  // Put commas on clean lines or keep them tidy
  // Restore strings
  sql = sql.replace(/__STR_(\d+)__/g, (_, idx) => stringTokens[Number(idx)]);

  // Indent secondary clauses
  const lines = sql.split('\n').map(line => line.trim()).filter(Boolean);
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(AND|OR|LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN|ON)\b/.test(line)) {
      formattedLines.push('  ' + line);
    } else {
      formattedLines.push(line);
    }
  }

  let result = formattedLines.join('\n');
  if (!result.endsWith(';')) {
    result += ';';
  }
  return result;
}

/**
 * Export rows to CSV formatted string with UTF-8 BOM for Excel compatibility
 */
export function exportToCsv(columns: string[], rows: Record<string, any>[]): string {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escapeCsv).join(',');
  const rowLines = rows.map(row => columns.map(col => escapeCsv(row[col])).join(','));

  return '\uFEFF' + [header, ...rowLines].join('\r\n');
}

/**
 * Export rows to Markdown Table
 */
export function exportToMarkdown(columns: string[], rows: Record<string, any>[]): string {
  if (columns.length === 0) return '';
  const header = `| ${columns.join(' | ')} |`;
  const separator = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map(r => `| ${columns.map(col => {
    const val = r[col];
    return val === null ? '*NULL*' : String(val).replace(/\|/g, '\\|');
  }).join(' | ')} |`).join('\n');

  return [header, separator, body].join('\n');
}

/**
 * Export rows to JSON formatted string
 */
export function exportToJson(rows: Record<string, any>[]): string {
  return JSON.stringify(rows, null, 2);
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
