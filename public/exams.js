// Fetch exams from GitHub JSON
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log('[HP Tracker] Exams loaded:', data);
    exams = Array.isArray(data) ? data : [];
    render();
  })
  .catch((error) => {
    console.error('[HP Tracker] Failed to load exams:', error);
    table.innerHTML = `
      <tr>
        <td colspan='4' style='text-align:center; padding: 30px; color:#e53e3e;'>
          ⚠️ Failed to load exams. Please check your connection and try again.
        </td>
      </tr>
    `;
  });
