const WEBSOCKET_URL =
  "ws://a3fa2db081a384355a34524044689663-865287451.us-east-1.elb.amazonaws.com/contributionHub"; // Update to your actual WebSocket URL

export class WebSocketService {
  private socket: WebSocket | null = null;
  private onOpenCallback: () => void = () => {};
  private onCloseCallback: () => void = () => {};
  private onErrorCallback: () => void = () => {};

  connect(
    onMessage: (data: any) => void,
    onOpen: () => void = () => {},
    onClose: () => void = () => {},
    onError: () => void = () => {}
  ) {
    this.onOpenCallback = onOpen;
    this.onCloseCallback = onClose;
    this.onErrorCallback = onError;

    try {
      this.socket = new WebSocket(WEBSOCKET_URL);

      // Handle connection open
      this.socket.onopen = (event) => {
        console.log("WebSocket connection established", event);

        // Send the handshake message required by SignalR
        const handshake = '{ "protocol": "json", "version": 1 }';
        this.socket?.send(handshake);
        console.log("Handshake sent:", handshake);

        // Call the custom open callback
        this.onOpenCallback();
      };

      // Handle incoming messages
      this.socket.onmessage = (event) => {
        try {
          // Check if the message is the acknowledgement message
          if (event.data === "{}" || event.data.trim() === "") {
            console.log("Empty message received (likely a handshake ACK)");
            return;
          }

          const data = JSON.parse(event.data);
          console.log("Message received:", data);

          // Check for SignalR ping messages
          if (data.type === 6) {
            console.log("Received ping message from server");
            return;
          }

          onMessage(data);
        } catch (error) {
          console.error("Error parsing message:", error, event.data);
        }
      };

      // Handle connection close
      this.socket.onclose = (event) => {
        console.log("WebSocket connection closed", event);
        this.onCloseCallback();
      };

      // Handle errors
      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onErrorCallback();
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.onErrorCallback();
    }
  }

  sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      this.socket.send(messageStr);
      console.log("Message sent:", messageStr);
    } else {
      console.error(
        "WebSocket is not open. Current state:",
        this.socket?.readyState
      );
      throw new Error("WebSocket is not open");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
