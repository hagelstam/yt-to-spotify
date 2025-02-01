const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement;

convertBtn.addEventListener('click', () => {
  const statusElement = document.getElementById('status')!;

  const urlElement = document.getElementById('url') as HTMLInputElement;
  const titleElement = document.getElementById('title') as HTMLInputElement;
  const artistElement = document.getElementById('artist') as HTMLInputElement;

  const url = urlElement.value.trim();
  const title = titleElement.value.trim();
  const artist = artistElement.value.trim();

  if (url.length === 0 || title.length === 0 || artist.length === 0) {
    statusElement.innerText = 'Please fill out all fields';
    return;
  }

  if (!url.includes('youtube.com')) {
    statusElement.innerText = 'Invalid YouTube URL';
    return;
  }

  convertBtn.disabled = true;
  convertBtn.innerText = 'Converting...';

  const queryParams = new URLSearchParams({ url, title, artist });
  const eventSource = new EventSource(
    'http://localhost:8080/convert?' + queryParams.toString(),
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.error) {
        statusElement.innerText = `Error: ${data.error}`;
        eventSource.close();
        convertBtn.disabled = false;
        return;
      }

      statusElement.innerText = data.message;

      if (data.status === 'completed') {
        eventSource.close();
        convertBtn.disabled = false;
        convertBtn.innerText = 'Convert';
      }
    } catch (error) {
      statusElement.innerText = 'Failed to process server message';
      eventSource.close();
      convertBtn.disabled = false;
      convertBtn.innerText = 'Convert';
    }
  };

  eventSource.onerror = () => {
    statusElement.innerText = 'Connection lost. Please try again.';
    eventSource.close();
    convertBtn.disabled = false;
    convertBtn.innerText = 'Convert';
  };
});
