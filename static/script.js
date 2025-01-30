function startConversion() {
  const convertBtn = document.getElementById('convertBtn');
  const statusEl = document.getElementById('status');

  const url = document.getElementById('url').value.trim();
  const title = document.getElementById('title').value.trim();
  const artist = document.getElementById('artist').value.trim();

  if (!url || !title || !artist) {
    statusEl.innerText = 'Please fill in all fields';
    statusEl.style.color = 'red';
    return;
  }

  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    statusEl.innerText = 'Invalid YouTube URL';
    statusEl.style.color = 'red';
    return;
  }

  convertBtn.disabled = true;
  statusEl.style.color = 'black';

  const queryParams = new URLSearchParams({ url, title, artist });
  const eventSource = new EventSource('/convert?' + queryParams.toString());

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.error) {
        statusEl.innerText = `Error: ${data.error}`;
        statusEl.style.color = 'red';
        eventSource.close();
        convertBtn.disabled = false;
        return;
      }

      statusEl.innerText = data.message;

      if (data.status === 'completed') {
        eventSource.close();
        convertBtn.disabled = false;
      }
    } catch (error) {
      statusEl.innerText = 'Failed to process server message';
      statusEl.style.color = 'red';
      eventSource.close();
      convertBtn.disabled = false;
    }
  };

  eventSource.onerror = (error) => {
    statusEl.innerText = 'Connection lost. Please try again.';
    statusEl.style.color = 'red';
    eventSource.close();
    convertBtn.disabled = false;
  };
}
