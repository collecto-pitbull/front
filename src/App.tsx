import { useEffect, useRef, useState } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { WebSocketService } from "./api/websocketService";
import { GlobalStyle } from "./GlobalStyle";
import { theme } from "./theme";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(143, 86, 207, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(143, 86, 207, 0); }
  100% { box-shadow: 0 0 0 0 rgba(143, 86, 207, 0); }
`;

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  padding: 20px;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const AppTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Card = styled.div`
  background: rgba(50, 50, 50, 0.85);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardTitle = styled.h2`
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  text-align: left;
  opacity: 0.9;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(100, 100, 100, 0.3);
  background: rgba(30, 30, 30, 0.6);
  color: ${(props) => props.theme.colors.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(143, 86, 207, 0.3);
  }

  &::placeholder {
    color: rgba(200, 200, 200, 0.5);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  animation: ${pulse} 2s infinite;

  &:hover {
    background: ${(props) => props.theme.colors.accent};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    animation: none;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => (props.connected ? "#4de680" : "#ff5555")};
`;

const StatusText = styled.span`
  color: ${(props) => (props.connected ? "#4de680" : "#ff5555")};
`;

const ContributionsList = styled.div`
  max-height: 300px;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(30, 30, 30, 0.4);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.primary};
    border-radius: 10px;
  }
`;

const ContributionItem = styled.div`
  background: rgba(60, 60, 60, 0.5);
  border-left: 3px solid ${(props) => props.theme.colors.primary};
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${(props) => props.theme.colors.accent};
`;

const BalanceAmount = styled.span`
  font-weight: 600;
  color: #4de680;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(200, 200, 200, 0.6);
  font-style: italic;
`;

const Badge = styled.div`
  display: inline-block;
  background: rgba(143, 86, 207, 0.2);
  color: ${(props) => props.theme.colors.primary};
  border-radius: 16px;
  padding: 3px 10px;
  font-size: 0.8rem;
  margin-left: 8px;
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webSocketServiceRef = useRef(null);

  useEffect(() => {
    // Create WebSocket service instance
    webSocketServiceRef.current = new WebSocketService();

    // Callbacks para eventos de conexión
    const handleConnectionOpen = () => {
      console.log("Connection established callback");
      setIsConnected(true);
    };

    const handleConnectionClose = () => {
      console.log("Connection closed callback");
      setIsConnected(false);
    };

    const handleConnectionError = () => {
      console.log("Connection error callback");
      setIsConnected(false);
    };

    // Connect to WebSocket and handle messages
    webSocketServiceRef.current.connect(
      // Callback para mensajes
      (data) => {
        console.log("Mensaje recibido:", data);

        // Procesamiento de mensajes
        if (data && typeof data === "object") {
          if (data.type === 1) {
            // Mensaje de conexión
            console.log("Conexión SignalR confirmada");
            setIsConnected(true);
          } else if (
            data.target === "ReceiveContribution" &&
            data.arguments &&
            data.arguments.length > 0
          ) {
            // Mensaje de contribución
            console.log("Contribución recibida:", data.arguments[0]);
            setMessages((prevMessages) => [data.arguments[0], ...prevMessages]);
          } else if (Array.isArray(data)) {
            // Array de mensajes
            setMessages((prevMessages) => [...data, ...prevMessages]);
          } else if (data.UserName && data.Balance !== undefined) {
            // Objeto directo de contribución
            console.log("Objeto de contribución recibido:", data);
            setMessages((prevMessages) => [data, ...prevMessages]);
          }
        }
      },
      handleConnectionOpen,
      handleConnectionClose,
      handleConnectionError
    );

    // Cleanup on component unmount
    return () => {
      if (webSocketServiceRef.current) {
        webSocketServiceRef.current.disconnect();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName.trim() || balance <= 0 || !isConnected) return;

    setIsSubmitting(true);

    // Formato exacto que requiere el backend
    const message = {
      type: 1,
      target: "SendContribution",
      arguments: [
        {
          UserName: userName.trim(),
          Balance: parseFloat(balance),
        },
      ],
    };

    try {
      console.log("Enviando mensaje:", message);
      webSocketServiceRef.current.sendMessage(JSON.stringify(message) + "");

      // Limpiar el formulario
      setUserName("");
      setBalance(0);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isFormValid = userName.trim() && balance > 0;

  // Función para reconectar manualmente
  const handleReconnect = () => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.disconnect();
    }

    webSocketServiceRef.current = new WebSocketService();

    const handleConnectionOpen = () => {
      console.log("Reconnection established");
      setIsConnected(true);
    };

    const handleConnectionClose = () => {
      console.log("Reconnection closed");
      setIsConnected(false);
    };

    const handleConnectionError = () => {
      console.log("Reconnection error");
      setIsConnected(false);
    };

    webSocketServiceRef.current.connect(
      (data) => {
        console.log("Mensaje recibido en reconexión:", data);

        if (data && typeof data === "object") {
          if (data.type === 1) {
            console.log("Conexión SignalR confirmada en reconexión");
            setIsConnected(true);
          } else if (
            data.target === "ReceiveContribution" &&
            data.arguments &&
            data.arguments.length > 0
          ) {
            console.log(
              "Contribución recibida en reconexión:",
              data.arguments[0]
            );
            setMessages((prevMessages) => [data.arguments[0], ...prevMessages]);
          } else if (Array.isArray(data)) {
            setMessages((prevMessages) => [...data, ...prevMessages]);
          } else if (data.UserName && data.Balance !== undefined) {
            console.log("Objeto de contribución recibido en reconexión:", data);
            setMessages((prevMessages) => [data, ...prevMessages]);
          }
        }
      },
      handleConnectionOpen,
      handleConnectionClose,
      handleConnectionError
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <ContentContainer>
          <AppTitle>Collecto</AppTitle>

          <Card>
            <CardTitle>Enviar datos</CardTitle>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="userName">Nombre de usuario</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Introduce tu nombre"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={balance || ""}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={!isFormValid || !isConnected || isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </SubmitButton>
            </form>

            <ConnectionStatus>
              <StatusIndicator connected={isConnected} />
              <StatusText connected={isConnected}>
                {isConnected ? "Conectado" : "Desconectado"}
              </StatusText>
              {!isConnected && (
                <button
                  onClick={handleReconnect}
                  style={{
                    marginLeft: "10px",
                    background: "transparent",
                    border: "1px solid #ff5555",
                    borderRadius: "4px",
                    color: "#ff5555",
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}>
                  Reconectar
                </button>
              )}
            </ConnectionStatus>
          </Card>

          <Card>
            <CardTitle>
              Contribuciones
              {messages.length > 0 && <Badge>{messages.length}</Badge>}
            </CardTitle>

            <ContributionsList>
              {messages.length === 0 ? (
                <EmptyState>
                  No hay contribuciones aún. ¡Sé el primero en contribuir!
                </EmptyState>
              ) : (
                messages.map((msg, index) => (
                  <ContributionItem key={index}>
                    <UserName>{msg.UserName}</UserName>
                    <BalanceAmount>{formatCurrency(msg.Balance)}</BalanceAmount>
                  </ContributionItem>
                ))
              )}
            </ContributionsList>
          </Card>
        </ContentContainer>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
