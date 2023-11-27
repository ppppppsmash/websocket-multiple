import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p>Hello World</p>
    <div class="triangle"></div>
    <div id="details"></div>
    <div class="square square-1"></div>
  </div>
`;

window.onload = () => {
  initWebSocket();
}

function initWebSocket() {
  const urlParams = new URLSearchParams(window.location.search);
  const browserId = urlParams.get('browser');
  const webSocketServer = new WebSocket(`ws://localhost:9999/?browser=${browserId}`);
  document.documentElement.classList.add(`theme-${browserId}`);

  webSocketServer.onopen = () => {
    console.log("Connected to the server");
    setInterval(() => sendSquareDetails(webSocketServer), 5);
  };

  webSocketServer.onmessage = (event) => {
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        recreateOtherSquare(JSON.parse(reader.result as string));
      };
      reader.readAsText(event.data);
    } else {
      recreateOtherSquare(JSON.parse(event.data));
    }
  };

  webSocketServer.onerror = (error) => {
    console.log('WebSocket Error: ' + error);
  };
}

function sendSquareDetails(ws: WebSocket) {
  const square = document.querySelector('.square') as HTMLElement;
  const rect = square.getBoundingClientRect();
  const details = {
    width: rect.width,
    height: rect.height,
    x: window.screenX + rect.left,
    y: window.screenY + rect.top
  };
  ws.send(JSON.stringify(details));
}

function recreateOtherSquare(details: { width: number; height: number; x: number; y: number }) {
  let otherSquare = document.getElementById('other-square') as HTMLElement;
  if (!otherSquare) {
    otherSquare = document.createElement('div');
    otherSquare.id = 'other-square';
    otherSquare.className = 'square-2';
    document.body.appendChild(otherSquare);
  }

  otherSquare.style.width = `${details.width}px`;
  otherSquare.style.height = `${details.height}px`;
  otherSquare.style.position = 'fixed';
  otherSquare.style.left = `${details.x - window.screenX}px`;
  otherSquare.style.top = `${details.y - window.screenY}px`;
}
