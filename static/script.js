function startConversion() {
  const eventSource = new EventSource('/convert');

  eventSource.onmessage = (event) => {
    document.getElementById('status').innerText = event.data;
    if (event.data.includes('done')) {
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    console.error('SSE connection lost.');
    eventSource.close();
  };
}
