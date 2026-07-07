import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sipel',
  connectionLimit: 5,
});

async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export const db = { query, now };
export default { query, now };
