import React, { useState, useEffect, useContext, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { SocketContext } from "../services/SocketContext";
import { Menu, Loading } from "../components";
import { getConversations, getMessages, getUserById } from "../services/api";

const Chat = () => {

    const router = useRouter();
    const { data: session, status } = useSession();
    const { socket } = useContext(SocketContext);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState("");
    const [users, setUsers] = useState({}); // Cache de informações dos usuários
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Estado para armazenar o histórico de mensagens da conversa de teste
    const [testConversationHistory, setTestConversationHistory] = useState([]);

    // Estado para controlar o índice do carrossel
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Função para avançar o carrossel
    const nextCarousel = () => {
        setCarouselIndex(prev => (prev + 1) % 3); // 3 páginas no total
    };

    // Função para voltar o carrossel
    const prevCarousel = () => {
        setCarouselIndex(prev => (prev - 1 + 3) % 3); // 3 páginas no total
    };
    const messagesEndRef = useRef(null);

    // Definir isAuthenticated antes de usá-lo nos useEffects
    const isAuthenticated = typeof window !== 'undefined' && (status === "authenticated" || !!localStorage.getItem("token"));

    // Função para rolar para o final das mensagens
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Carregar conversas do usuário
    useEffect(() => {
        // Retornar cedo se não estiver autenticado
        if (!isAuthenticated) {
            return;
        }

        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                const data = await getConversations();
                setConversations(data);

                // Buscar informações dos usuários das conversas
                const userIds = data.map((conv) => conv._id.toString());
                const userPromises = userIds.map((id) => getUserById(id));
                const userData = await Promise.all(userPromises);
                const userMap = userData.reduce((acc, user) => {
                    if (user && user._id) {
                        acc[user._id] = user;
                    }
                    return acc;
                }, {});
                setUsers(userMap);

                // Carregar o usuário e a conversa de teste para que apareçam na lista de contatos
                console.log("Carregando usuário e conversa de teste...");
                try {
                    const response = await fetch('/api/test-conversation');

                    if (!response.ok) {
                        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
                    }

                    const testData = await response.json();
                    console.log("Dados de teste recebidos:", testData);

                    // Verificar se testData e testData.user existem antes de acessar propriedades
                    if (testData && testData.user && testData.user._id) {
                        console.log("Adicionando usuário de teste:", testData.user);
                        // Adicionar usuário de teste
                        setUsers(prev => ({
                            ...prev,
                            [testData.user._id]: testData.user
                        }));
                    } else {
                        console.error("Dados de usuário de teste inválidos:", testData);
                    }

                    // Verificar se testData.conversation existe antes de usá-lo
                    if (testData && testData.conversation) {
                        console.log("Adicionando conversa de teste:", testData.conversation);
                        // Adicionar conversa de teste
                        setConversations(prev => {
                            // Verificar se a conversa já existe
                            const conversationExists = prev.some(conv => conv._id === testData.conversation._id);
                            if (!conversationExists) {
                                return [...prev, testData.conversation];
                            }
                            return prev;
                        });

                        // Não selecionar automaticamente a conversa de teste
                        // O usuário deve clicar no contato para carregar as mensagens
                    } else {
                        console.error("Dados de conversa de teste inválidos:", testData);
                    }

                    // Não carregar mensagens de teste automaticamente
                    // As mensagens serão carregadas quando o usuário selecionar a conversa
                } catch (error) {
                    console.error("Erro ao carregar conversa de teste:", error);
                }
            } catch (error) {
                console.error("Erro ao carregar conversas:", error);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, [isAuthenticated]);

    // Carregar mensagens de uma conversa selecionada
    useEffect(() => {
        // Não usar return dentro de condições para evitar hooks condicionais
        // Isso garante que o mesmo número de hooks seja chamado em cada renderização
        if (!selectedConversation || !isAuthenticated) {
            return; // Retornar cedo se as condições não forem atendidas
        }

        // Não carregar mensagens para a conversa de teste via API normal
        // As mensagens de teste são carregadas na função selectConversation
        if (selectedConversation === "test-user-123") {
            // Para a conversa de teste, apenas rolar para o final se já tivermos mensagens
            if (messages.length > 0) {
                setTimeout(scrollToBottom, 100);
            }
            return;
        }

        // Para conversas normais, carregar mensagens da API
        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const data = await getMessages(selectedConversation);
                setMessages(data);
                // Rolar para o final das mensagens após carregá-las
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("Erro ao carregar mensagens:", error);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedConversation, isAuthenticated, messages.length]);

    // Receber mensagens em tempo real
    useEffect(() => {
        // Retornar cedo se as condições não forem atendidas
        if (!socket || !isAuthenticated) {
            return;
        }

        // Obter o ID do usuário do localStorage ou da sessão
        const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);

        if (!userId) {
            return;
        }

        socket.emit("join", userId);
        socket.on("private_message", (message) => {
            if (
                message.sender === selectedConversation ||
                message.receiver === selectedConversation
            ) {
                setMessages((prev) => [...prev, message]);
                // Rolar para o final quando receber uma nova mensagem
                setTimeout(scrollToBottom, 100);
            }
            // Atualizar lista de conversas
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id.toString() === message.sender ||
                        conv._id.toString() === message.receiver
                        ? { ...conv, lastMessageAt: message.timestamp }
                        : conv
                )
            );
        });

        return () => {
            socket.off("private_message");
        };
    }, [socket, selectedConversation, isAuthenticated]);

    // Enviar mensagem
    const sendMessage = () => {
        if (messageContent.trim() && selectedConversation) {
            setSendingMessage(true);

            // Obter o ID do usuário do localStorage ou da sessão
            const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null) || "current-user";

            // Verificar se é a conversa de teste
            if (selectedConversation === "test-user-123") {
                // Adicionar mensagem do usuário
                const userMessage = {
                    _id: `msg-${Date.now()}`,
                    sender: userId,
                    receiver: selectedConversation,
                    content: messageContent,
                    timestamp: new Date().toISOString(),
                };

                // Adicionar à lista de mensagens
                setMessages(prev => {
                    const newMessages = [...prev, userMessage];
                    // Atualizar também o histórico de mensagens
                    setTestConversationHistory(newMessages);
                    return newMessages;
                });

                // Atualizar a hora da última mensagem na conversa
                setConversations(prev =>
                    prev.map(conv =>
                        conv._id === "test-user-123"
                            ? { ...conv, lastMessageAt: new Date().toISOString() }
                            : conv
                    )
                );

                // Simular resposta automática após 1 segundo
                setTimeout(() => {
                    // Escolher uma resposta com base no conteúdo da mensagem
                    let responseContent = "Esta é uma resposta automática para teste. O chat está funcionando corretamente!";

                    // Personalizar resposta com base no conteúdo da mensagem
                    const lowerCaseMessage = messageContent.toLowerCase();
                    if (lowerCaseMessage.includes("olá") || lowerCaseMessage.includes("oi") || lowerCaseMessage.includes("ola")) {
                        responseContent = "Olá! Como posso ajudar você hoje?";
                    } else if (lowerCaseMessage.includes("ajuda") || lowerCaseMessage.includes("help")) {
                        responseContent = "Estou aqui para ajudar! Este é um chat de teste para demonstrar a funcionalidade do sistema.";
                    } else if (lowerCaseMessage.includes("tchau") || lowerCaseMessage.includes("adeus")) {
                        responseContent = "Até logo! Foi um prazer conversar com você.";
                    } else if (lowerCaseMessage.includes("obrigado") || lowerCaseMessage.includes("obrigada")) {
                        responseContent = "De nada! Estou sempre à disposição.";
                    }

                    const autoReply = {
                        _id: `msg-${Date.now() + 1}`,
                        sender: "test-user-123",
                        receiver: userId,
                        content: responseContent,
                        timestamp: new Date().toISOString(),
                    };

                    // Adicionar resposta à lista de mensagens
                    setMessages(prev => {
                        const newMessages = [...prev, autoReply];
                        // Atualizar também o histórico de mensagens
                        setTestConversationHistory(newMessages);
                        return newMessages;
                    });

                    // Atualizar a hora da última mensagem na conversa
                    setConversations(prev =>
                        prev.map(conv =>
                            conv._id === "test-user-123"
                                ? { ...conv, lastMessageAt: new Date().toISOString() }
                                : conv
                        )
                    );

                    // Rolar para o final
                    setTimeout(scrollToBottom, 100);
                }, 1000);

                setMessageContent("");
                setTimeout(scrollToBottom, 100);
            } else if (socket && userId) {
                // Enviar mensagem via socket para conversas reais
                socket.emit("private_message", {
                    sender: userId,
                    receiver: selectedConversation,
                    content: messageContent,
                });
                setMessageContent("");
            } else {
                console.error("ID do usuário não encontrado ou socket não disponível");
                alert("Erro ao enviar mensagem: Verifique sua conexão");
            }

            setSendingMessage(false);
        }
    };

    // Lidar com a tecla Enter para enviar mensagem
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Selecionar uma conversa
    const selectConversation = async (userId) => {
        // Se já estiver selecionado, desselecionar (voltar para a tela inicial)
        if (selectedConversation === userId) {
            setSelectedConversation(null);
            setMessages([]);
            return;
        }

        // Caso contrário, selecionar a nova conversa
        setSelectedConversation(userId);

        // Se for a conversa de teste, carregar mensagens de teste
        if (userId === "test-user-123") {
            try {
                console.log("Carregando conversa de teste...");
                setLoadingMessages(true);

                // Verificar se já temos histórico de mensagens
                if (testConversationHistory.length > 0) {
                    console.log("Usando histórico de mensagens existente:", testConversationHistory);
                    setMessages(testConversationHistory);
                    setTimeout(scrollToBottom, 100);
                    setLoadingMessages(false);
                    return;
                }

                // Se não temos histórico, carregar as mensagens iniciais da API
                const response = await fetch('/api/test-conversation');

                if (!response.ok) {
                    throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
                }

                const testData = await response.json();
                console.log("Dados de teste recebidos:", testData);

                // Verificar se testData.messages existe antes de usá-lo
                if (testData && testData.messages) {
                    console.log("Carregando mensagens de teste:", testData.messages);
                    // Carregar mensagens de teste
                    setMessages(testData.messages);
                    // Salvar no histórico
                    setTestConversationHistory(testData.messages);
                    // Rolar para o final das mensagens após carregá-las
                    setTimeout(scrollToBottom, 100);
                } else {
                    console.error("Dados de mensagens de teste inválidos:", testData);
                }
            } catch (error) {
                console.error("Erro ao carregar mensagens de teste:", error);
            } finally {
                setLoadingMessages(false);
            }
        } else {
            // Para outras conversas, limpar as mensagens
            setMessages([]);
        }
    };

    // Verificar se o token está disponível no localStorage
    // Este useEffect sempre será executado, independentemente de condições
    useEffect(() => {
        // Verificação de window movida para dentro do useEffect
        // Isso garante que o mesmo número de hooks seja chamado em cada renderização
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token");
            console.log("Token disponível:", !!token);
            console.log("Status da sessão:", status);

            if (status !== "authenticated" && !token) {
                // Se não estiver autenticado e não tiver token, redirecionar para login
                router.push('/login');
            }
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading size="large" />
            </div>
        );
    }

    if (!isAuthenticated && status !== "loading") {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-xl text-center mb-4">Por favor, faça login para acessar o chat.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-[#4d87fc] text-white px-4 py-2 rounded-md hover:bg-[#3a6fd9] transition-colors"
                    >
                        Ir para o login
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div id="chat" className="w-screen h-screen flex flex-row justify-start items-start">
            <Menu />
            <div className="flex flex-col justify-start items-start flex-grow h-full p-5 gap-7">
                <div id="mensage" className="flex flex-col justify-start items-start px-2 gap-0">
                    <p className="text-2xl font-medium text-left text-[#4d87fc]">
                        Seus contatos!
                    </p>
                    <div className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                        <p className="text-sm font-medium text-left">
                            <span className="text-sm font-medium text-left text-black">Você tem </span>
                            <span className="text-sm font-medium text-left text-[#ffa2df]">{conversations.length}</span>
                            <span className="text-sm font-medium text-left text-black"> conversas</span>
                        </p>
                    </div>
                </div>
                <div className="flex justify-start items-center h-full w-full">
                    <div id='menu de mensagens'
                        className="flex flex-col justify-start items-start h-full px-6 py-4 gap-4 rounded-tl-lg bg-[#fff5fc]"
                        style={{ boxShadow: "5px 0px 20px -15px rgba(0,0,0,0.25)" }}
                    >
                        <div id='contatos-online' className="flex flex-col justify-start items-start relative gap-2">
                            <p className="text-xl font-semibold text-left text-black">
                                Online
                            </p>
                            <div id='itens' className="flex justify-between items-center w-full">
                                <button
                                    onClick={prevCarousel}
                                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                >
                                    <span className="text-gray-600">&lt;</span>
                                </button>

                                <div className="flex justify-center items-center gap-1 overflow-hidden">
                                    {/* Página 1 do carrossel */}
                                    {carouselIndex === 0 && (
                                        <>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 48.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 49.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 50.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 51.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 53.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Página 2 do carrossel */}
                                    {carouselIndex === 1 && (
                                        <>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 48.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 49.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 50.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 51.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 53.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Página 3 do carrossel */}
                                    {carouselIndex === 2 && (
                                        <>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 48.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 49.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 50.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 51.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-slate-600">
                                                <img
                                                    src="Frame 53.png"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={nextCarousel}
                                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                >
                                    <span className="text-gray-600">&gt;</span>
                                </button>
                            </div>
                        </div>

                        <div id='ultimas-mensagens' className="flex flex-col justify-start items-start relative gap-2">
                            <p className="text-xl font-semibold text-left text-black">
                                Mensagens
                            </p>



                            <div id='contatos' className="flex flex-col justify-start items-start gap-1 w-full">
                                {loadingConversations ? (
                                    <div className="py-4 flex justify-center w-full">
                                        <Loading size="medium" />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="py-4 text-center w-full text-gray-500">
                                        Nenhuma conversa encontrada
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv._id}
                                            onClick={() => selectConversation(conv._id.toString())}
                                            className={`flex justify-start items-center h-fit relative gap-4 px-3 py-3 rounded-lg cursor-pointer w-full hover:bg-gray-100 transition-colors ${selectedConversation === conv._id.toString() ? "bg-gray-200" : ""
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                                {users[conv._id]?.username?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex flex-col justify-start items-start">
                                                <p className="text-base font-medium text-left text-[#1e1e1e]">
                                                    {users[conv._id]?.username || "Usuário"}
                                                </p>
                                                <p className="text-sm font-light text-left text-[#646464]">
                                                    {conv.lastMessageAt
                                                        ? new Date(conv.lastMessageAt).toLocaleTimeString()
                                                        : "Sem mensagens"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between bg-white w-full h-full" style={{ boxShadow: "5px 0px 20px -15px rgba(0,0,0,0.25)" }}>
                        {selectedConversation ? (
                            <>
                                {/* Cabeçalho da conversa */}
                                <div className="p-4 border-b flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                        {users[selectedConversation]?.username?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="font-medium">{users[selectedConversation]?.username || "Usuário"}</p>
                                    </div>
                                </div>

                                {/* Área de mensagens */}
                                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                    {loadingMessages ? (
                                        <div className="flex justify-center items-center h-full">
                                            <Loading size="medium" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex justify-center items-center h-full text-gray-500">
                                            Nenhuma mensagem encontrada. Comece a conversar!
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.sender === (session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null)) ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`p-3 rounded-lg max-w-[70%] ${
                                                        msg.sender === (session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null))
                                                            ? "bg-[#4d87fc] text-white"
                                                            : "bg-gray-100"
                                                    }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${msg.sender === (session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null)) ? 'text-gray-200' : 'text-gray-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {/* Referência para rolar para o final */}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Área de input */}
                                <div className="p-4 border-t flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1 border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4d87fc]"
                                        placeholder="Digite sua mensagem..."
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={sendingMessage || !messageContent.trim()}
                                        className={`bg-[#4d87fc] text-white p-3 rounded-full hover:bg-[#3a6fd9] transition-colors ${
                                            sendingMessage || !messageContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {sendingMessage ? <Loading size="small" color="#ffffff" /> : 'Enviar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-full">
                            <svg
                                width={300}
                                height={300}
                                viewBox="0 0 776 776"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex-grow-0 flex-shrink-0 w-64 h-64 relative opacity-70"
                                preserveAspectRatio="none">

                                <path d="M776 593.485H0V593.873H776V593.485Z" fill="#EBEBEB" />
                                <path d="M698.245 618.456H646.843V618.844H698.245V618.456Z" fill="#EBEBEB" />
                                <path d="M514.053 622.678H500.567V623.066H514.053V622.678Z" fill="#EBEBEB" />
                                <path d="M645.291 604.054H615.508V604.442H645.291V604.054Z" fill="#EBEBEB" />
                                <path d="M148.449 606.661H81.4179V607.049H148.449V606.661Z" fill="#EBEBEB" />
                                <path d="M172.101 606.661H162.277V607.049H172.101V606.661Z" fill="#EBEBEB" />
                                <path d="M349.433 613.211H204.041V613.599H349.433V613.211Z" fill="#EBEBEB" />
                                <path
                                    d="M367.824 524.266H68.1483C65.8007 524.261 63.5506 523.326 61.892 521.665C60.2334 520.003 59.3019 517.751 59.3019 515.404V94.1443C59.3223 91.8101 60.2629 89.5783 61.9193 87.9335C63.5756 86.2888 65.8141 85.364 68.1483 85.36H367.824C370.174 85.36 372.428 86.2936 374.09 87.9556C375.752 89.6175 376.686 91.8716 376.686 94.2219V515.404C376.686 517.754 375.752 520.008 374.09 521.67C372.428 523.332 370.174 524.266 367.824 524.266ZM68.1483 85.6704C65.9036 85.6745 63.7522 86.5691 62.1664 88.1578C60.5806 89.7465 59.6899 91.8996 59.6899 94.1443V515.404C59.6899 517.648 60.5806 519.801 62.1664 521.39C63.7522 522.979 65.9036 523.873 68.1483 523.878H367.824C370.07 523.873 372.223 522.979 373.811 521.391C375.4 519.803 376.294 517.65 376.298 515.404V94.1443C376.294 91.8981 375.4 89.7451 373.811 88.1569C372.223 86.5686 370.07 85.6745 367.824 85.6704H68.1483Z"
                                    fill="#EBEBEB"
                                />
                                <path
                                    d="M703.537 524.266H403.846C401.497 524.261 399.245 523.327 397.584 521.665C395.923 520.004 394.988 517.753 394.984 515.404V94.1443C395.009 91.8087 395.952 89.5769 397.611 87.9326C399.27 86.2883 401.51 85.3639 403.846 85.36H703.537C705.869 85.3681 708.103 86.2947 709.756 87.939C711.409 89.5833 712.348 91.8128 712.368 94.1443V515.404C712.368 517.749 711.439 519.998 709.783 521.659C708.128 523.32 705.882 524.257 703.537 524.266ZM403.846 85.6704C401.6 85.6745 399.447 86.5686 397.858 88.1569C396.27 89.7451 395.376 91.8981 395.372 94.1443V515.404C395.376 517.65 396.27 519.803 397.858 521.391C399.447 522.979 401.6 523.873 403.846 523.878H703.537C705.783 523.873 707.936 522.979 709.525 521.391C711.113 519.803 712.007 517.65 712.011 515.404V94.1443C712.007 91.8981 711.113 89.7451 709.525 88.1569C707.936 86.5686 705.783 85.6745 703.537 85.6704H403.846Z"
                                    fill="#EBEBEB"
                                />
                                <path
                                    d="M640.79 211.429L573.945 172.536H522.434L454.457 209.582V461.658H640.79V211.429Z"
                                    fill="#E0E0E0"
                                />
                                <path
                                    d="M452.548 211.429L454.457 209.582C479.224 185.733 512.294 172.448 546.676 172.536C581.046 172.434 614.109 185.696 638.881 209.52L640.79 211.367V461.658H452.548V211.429ZM628.312 216.783C606.027 196.36 576.897 185.031 546.669 185.031C516.441 185.031 487.311 196.36 465.026 216.783V449.18H628.312V216.783Z"
                                    fill="#FAFAFA"
                                />
                                <path
                                    d="M551.348 450.685H541.989V367.017H462.667V357.658H541.989V272.097H462.667V262.723H541.989V183.4H551.348V262.723H630.671V272.097H551.348V357.658H630.671V367.017H551.348V450.685Z"
                                    fill="#F0F0F0"
                                />
                                <path
                                    d="M446.293 208.884L448.124 207.052C474.282 180.952 509.725 166.293 546.676 166.293C583.628 166.293 619.071 180.952 645.228 207.052L647.06 208.884V467.912H446.293V208.884ZM634.551 214.083C610.903 191.426 579.418 178.778 546.669 178.778C513.919 178.778 482.435 191.426 458.787 214.083V455.419H634.551V214.083Z"
                                    fill="#F0F0F0"
                                />
                                <path d="M263.002 281.688H257.26V372.744H263.002V281.688Z" fill="#E0E0E0" />
                                <path
                                    d="M260.131 434.389C291.417 434.389 316.779 415.934 316.779 393.168C316.779 370.402 291.417 351.947 260.131 351.947C228.845 351.947 203.483 370.402 203.483 393.168C203.483 415.934 228.845 434.389 260.131 434.389Z"
                                    fill="#E0E0E0"
                                />
                                <path
                                    d="M135.66 428.243V591.886H155.34V470.489H364.937V591.886H384.617V428.243H135.66Z"
                                    fill="#E0E0E0"
                                />
                                <path d="M391.306 418.45H128.956V454.208H391.306V418.45Z" fill="#F0F0F0" />
                                <path d="M299.412 349.138H220.834V363.897H299.412V349.138Z" fill="#E0E0E0" />
                                <path
                                    d="M336.613 335.496H183.648L214.021 225.738H306.241L336.613 335.496Z"
                                    fill="#F0F0F0"
                                />
                                <path
                                    d="M388 663.573C554.192 663.573 688.917 655.707 688.917 646.004C688.917 636.302 554.192 628.436 388 628.436C221.808 628.436 87.0827 636.302 87.0827 646.004C87.0827 655.707 221.808 663.573 388 663.573Z"
                                    fill="#F5F5F5"
                                />
                                <path
                                    d="M574.442 574.628C574.182 574.631 573.928 574.555 573.712 574.411C559.279 564.556 542.672 524.995 542.052 523.303C541.986 523.148 541.952 522.98 541.951 522.811C541.951 522.642 541.984 522.475 542.049 522.319C542.114 522.163 542.21 522.021 542.33 521.903C542.45 521.784 542.593 521.69 542.75 521.627C542.907 521.561 543.075 521.527 543.245 521.526C543.415 521.526 543.584 521.559 543.741 521.624C543.899 521.689 544.042 521.784 544.162 521.905C544.282 522.025 544.377 522.168 544.442 522.326C544.597 522.714 560.644 561.126 574.256 571.602C577.856 567.722 593.205 552.729 620.738 546.77C620.904 546.734 621.076 546.731 621.243 546.762C621.41 546.793 621.569 546.856 621.712 546.948C621.855 547.04 621.978 547.16 622.074 547.3C622.171 547.439 622.239 547.597 622.274 547.763C622.31 547.929 622.313 548.101 622.282 548.268C622.251 548.435 622.188 548.594 622.096 548.737C622.004 548.88 621.884 549.003 621.744 549.099C621.605 549.196 621.447 549.264 621.281 549.299C591.126 555.771 575.59 573.945 575.435 574.131C575.316 574.282 575.166 574.405 574.994 574.491C574.822 574.577 574.634 574.623 574.442 574.628Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M580.184 541.539C580.184 541.539 576.475 514.271 559.03 511.291C541.586 508.311 546.847 495.119 542.3 490.013C537.753 484.907 525.88 499.961 536.092 514.55C546.304 529.139 537.939 524.56 542.3 538.125C546.661 551.689 581.783 564.152 580.184 541.539Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.2"
                                    d="M580.184 541.539C580.184 541.539 576.475 514.271 559.03 511.291C541.586 508.311 546.847 495.119 542.3 490.013C537.753 484.907 525.88 499.961 536.092 514.55C546.304 529.139 537.939 524.56 542.3 538.125C546.661 551.689 581.783 564.152 580.184 541.539Z"
                                    fill="white"
                                />
                                <path
                                    d="M576.49 560.8C576.264 560.804 576.044 560.729 575.868 560.587C575.692 560.445 575.572 560.245 575.528 560.024C573.665 551.944 571.386 543.967 568.699 536.123C563.097 518.849 557.308 500.97 561.265 481.803C564.509 466.066 572.44 451.586 580.122 437.586C581.405 435.238 582.678 432.899 583.94 430.571C584.964 428.662 586.004 426.753 587.044 424.845C594.09 411.808 601.384 398.321 606.522 384.244C612.947 366.676 613.847 351.652 609.269 338.15C609.202 337.906 609.232 337.646 609.351 337.423C609.469 337.199 609.669 337.03 609.908 336.949C610.148 336.868 610.409 336.881 610.639 336.986C610.869 337.091 611.051 337.279 611.147 337.513C615.803 351.404 614.964 366.908 608.384 384.927C603.185 399.143 595.859 412.677 588.767 425.776L585.663 431.503C584.406 433.846 583.117 436.159 581.829 438.533C574.225 452.408 566.309 466.749 563.205 482.191C559.356 500.815 564.757 517.67 570.593 535.487C573.303 543.395 575.598 551.441 577.468 559.589C577.519 559.844 577.468 560.109 577.326 560.326C577.183 560.544 576.962 560.697 576.708 560.753L576.49 560.8Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M614.592 352.18C614.592 352.18 626.48 319.107 601.54 317.725C576.599 316.344 603.262 348.315 614.592 352.18Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M592.212 377.245C592.212 377.245 585.601 346.701 567.691 352.614C549.781 358.528 574.535 377.338 592.212 377.245Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M622.212 380.69C622.212 380.69 620.195 356.401 639.02 356.432C657.846 356.463 648.891 377.508 622.212 380.69Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M608.384 429.764C608.384 429.764 634.24 407.943 642.869 424.938C651.499 441.932 623.252 444.648 608.384 429.764Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M563.811 424.55C563.811 424.55 560.07 387.053 539.367 398.166C518.663 409.278 545.931 427.809 563.811 424.55Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M544.411 477.581C544.411 477.581 560.489 440.225 532.398 443.717C504.307 447.209 524.917 467.881 544.411 477.581Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M586.966 492.217C586.966 492.217 611.348 465.026 629.15 474.338C646.951 483.65 631.462 510.934 586.966 492.217Z"
                                    fill="#407BFF"
                                />
                                <g opacity="0.2">
                                    <path
                                        d="M614.592 352.18C614.592 352.18 626.48 319.107 601.54 317.725C576.599 316.344 603.262 348.315 614.592 352.18Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M592.212 377.245C592.212 377.245 585.601 346.701 567.691 352.614C549.781 358.528 574.535 377.338 592.212 377.245Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M622.212 380.69C622.212 380.69 620.195 356.401 639.02 356.432C657.846 356.463 648.891 377.508 622.212 380.69Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M608.384 429.764C608.384 429.764 634.24 407.943 642.869 424.938C651.499 441.932 623.252 444.648 608.384 429.764Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M563.811 424.55C563.811 424.55 560.07 387.053 539.367 398.166C518.663 409.278 545.931 427.809 563.811 424.55Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M544.411 477.581C544.411 477.581 560.489 440.225 532.398 443.717C504.307 447.209 524.917 467.881 544.411 477.581Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M586.966 492.217C586.966 492.217 611.348 465.026 629.15 474.338C646.951 483.65 631.462 510.934 586.966 492.217Z"
                                        fill="white"
                                    />
                                </g>
                                <path
                                    d="M602.595 397.405C602.492 397.421 602.387 397.421 602.285 397.405C602.158 397.366 602.041 397.302 601.94 397.216C601.838 397.131 601.755 397.026 601.695 396.909C601.617 396.722 592.523 378.083 585.383 373.535C585.182 373.386 585.045 373.167 584.999 372.921C584.953 372.675 585.001 372.42 585.135 372.209C585.268 371.997 585.477 371.843 585.718 371.778C585.96 371.714 586.217 371.743 586.439 371.859C593.174 376.158 601.043 391.197 603.014 395.139C617.122 387.379 627.768 372.558 627.846 372.418C628.017 372.275 628.231 372.194 628.454 372.187C628.676 372.181 628.895 372.249 629.074 372.382C629.253 372.514 629.382 372.703 629.441 372.918C629.5 373.133 629.485 373.361 629.398 373.566C628.932 374.203 617.913 389.505 603.014 397.359C602.88 397.407 602.736 397.422 602.595 397.405Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M578.43 443.174H578.213C578.08 443.142 577.954 443.083 577.845 443C577.735 442.917 577.644 442.812 577.577 442.693C577.468 442.491 566.061 422.129 550.96 412.677C550.849 412.609 550.752 412.519 550.676 412.413C550.6 412.307 550.546 412.187 550.517 412.059C550.488 411.932 550.485 411.8 550.507 411.672C550.53 411.543 550.579 411.421 550.65 411.311C550.716 411.2 550.805 411.104 550.909 411.028C551.014 410.952 551.133 410.898 551.259 410.869C551.385 410.84 551.515 410.837 551.643 410.859C551.77 410.882 551.892 410.93 552 411.001C565.828 419.645 576.289 436.562 578.756 440.784C600.702 425.667 627.582 427.079 627.862 427.095C628.122 427.111 628.366 427.229 628.541 427.424C628.715 427.618 628.806 427.874 628.793 428.135C628.766 428.394 628.642 428.634 628.447 428.806C628.251 428.979 627.998 429.071 627.737 429.066C627.474 429.066 600.531 427.654 579.005 443.034C578.834 443.143 578.632 443.192 578.43 443.174Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M562.196 504.059C561.963 504.059 561.738 503.977 561.56 503.826C546.878 491.41 536.169 461.084 535.735 459.796C535.691 459.673 535.672 459.544 535.678 459.414C535.685 459.284 535.717 459.157 535.774 459.04C535.83 458.923 535.909 458.818 536.007 458.732C536.104 458.646 536.217 458.58 536.34 458.538C536.461 458.495 536.59 458.476 536.719 458.482C536.847 458.489 536.973 458.522 537.089 458.578C537.205 458.635 537.308 458.714 537.393 458.811C537.477 458.908 537.542 459.021 537.582 459.144C537.69 459.454 548.306 489.501 562.321 501.886C566.899 499.449 594.913 485.109 616.175 485.109H616.532C616.793 485.113 617.041 485.219 617.224 485.405C617.407 485.591 617.51 485.841 617.51 486.102C617.506 486.363 617.399 486.611 617.213 486.794C617.028 486.977 616.777 487.08 616.516 487.08H616.144C593.888 487.08 562.941 503.764 562.631 503.934C562.498 504.009 562.349 504.051 562.196 504.059Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M570.515 546.459C570.515 546.459 561.358 528.239 578.555 521.519C595.751 514.798 598.156 522.155 608.912 517.126C619.667 512.098 629.088 497.897 629.584 507.814C630.081 517.732 617.913 521.782 621.467 526.733C625.021 531.684 590.303 556.547 570.515 546.459Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M570.686 537.365C570.686 537.365 557.897 524.452 546.77 524.685C535.642 524.918 528.301 513.666 526.019 521.922C523.738 530.179 540.096 552.248 570.686 537.365Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M510.732 535.192L515.031 572.207L515.59 577.111L517.375 592.631L518.663 603.604L519.501 610.743L523.66 646.749H630.872L635.047 610.743L635.87 603.604L637.158 592.631L638.943 577.111L639.517 572.207L643.816 535.192H510.732Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.4"
                                    d="M517.375 592.631L518.663 603.604H635.87L637.158 592.631H517.375Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M519.501 610.743L523.66 646.749H630.872L635.047 610.743H519.501Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M515.031 572.207L515.59 577.111H638.943L639.517 572.207H515.031Z"
                                    fill="black"
                                />
                                <path
                                    d="M374.73 267.704H315.599C310.207 267.704 305.036 269.846 301.223 273.659C297.41 277.472 295.268 282.643 295.268 288.036V345.46C295.272 350.851 297.415 356.02 301.227 359.831C305.039 363.643 310.208 365.787 315.599 365.791H339.159L345.367 387.255L352.77 365.791H374.668C380.06 365.791 385.232 363.649 389.045 359.836C392.857 356.023 395 350.852 395 345.46V288.036C395.004 282.653 392.871 277.489 389.071 273.677C385.271 269.865 380.113 267.717 374.73 267.704Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.7"
                                    d="M374.73 267.704H315.599C310.207 267.704 305.036 269.846 301.223 273.659C297.41 277.472 295.268 282.643 295.268 288.036V345.46C295.272 350.851 297.415 356.02 301.227 359.831C305.039 363.643 310.208 365.787 315.599 365.791H339.159L345.367 387.255L352.77 365.791H374.668C380.06 365.791 385.232 363.649 389.045 359.836C392.857 356.023 395 350.852 395 345.46V288.036C395.004 282.653 392.871 277.489 389.071 273.677C385.271 269.865 380.113 267.717 374.73 267.704Z"
                                    fill="white"
                                />
                                <path
                                    d="M324.632 305.247C329.753 296.665 339.826 299.815 345.087 306.365C350.178 299.676 360.142 296.277 365.496 304.72C374.529 318.967 356.479 332.5 347.943 337.824C346.981 338.429 346.174 338.941 345.506 339.376C344.823 339.003 343.954 338.522 343.039 337.932C334.363 332.795 315.972 319.712 324.632 305.247Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M582.388 646.749H147.44C145.844 644.265 144.845 641.444 144.522 638.508C144.522 638.213 144.522 637.903 144.445 637.608C144.367 637.313 144.445 637.003 144.445 636.708C144.445 636.413 144.445 636.103 144.445 635.792C144.462 635.148 144.519 634.505 144.615 633.868C144.615 633.62 144.615 633.371 144.755 633.138C144.895 632.906 144.879 632.564 144.941 632.3C145.008 631.996 145.09 631.695 145.19 631.4C145.357 630.828 145.565 630.268 145.81 629.724C145.919 629.46 146.043 629.181 146.167 628.917L146.586 628.125L147.052 627.365C147.376 626.859 147.728 626.372 148.107 625.906C148.294 625.658 148.495 625.44 148.697 625.208L149.194 624.664L150.296 623.656C150.683 623.33 151.087 623.024 151.506 622.74C151.848 622.489 152.205 622.261 152.577 622.057H152.67L153.695 621.498L154.083 621.328C154.501 621.121 154.931 620.94 155.371 620.784C155.759 620.629 156.178 620.474 156.597 620.35C168.594 616.656 201.512 619.636 205.268 619.636C205.492 619.631 205.713 619.584 205.919 619.496C208.263 618.565 211.801 613.133 214.285 608.85L214.688 608.151C216.116 605.668 217.125 603.697 217.233 603.495H213.571C214.586 601.64 215.493 599.728 216.287 597.768C216.721 596.728 217.125 595.673 217.482 594.664C217.637 594.245 217.777 593.842 217.916 593.423C218.397 591.964 218.816 590.536 219.189 589.201C219.375 588.534 219.546 587.867 219.701 587.23C219.856 586.594 219.996 585.989 220.12 585.383C220.244 584.778 220.353 584.375 220.446 583.831C220.539 583.288 220.586 583.102 220.632 582.776C220.788 582.047 220.896 581.395 220.989 580.82C220.989 580.557 221.067 580.308 221.098 580.076L221.191 579.486C221.191 579.3 221.191 579.144 221.191 578.989C221.191 578.834 221.191 578.694 221.191 578.57C221.191 578.151 221.191 577.918 221.191 577.918H218.444C218.351 577.127 218.289 576.366 218.242 575.528V574.442C218.242 574.147 218.242 573.836 218.242 573.542C218.242 572.657 218.242 571.757 218.242 570.857C218.242 570.267 218.242 569.677 218.242 569.072C218.242 568.467 218.242 568.048 218.335 567.52C218.428 566.992 218.335 566.961 218.335 566.666C218.444 565.207 218.584 563.764 218.77 562.336C218.77 561.855 218.894 561.374 218.956 560.893C219.018 560.412 219.08 559.962 219.158 559.48C219.298 558.549 219.453 557.618 219.608 556.702C219.763 555.787 219.934 554.887 220.105 554.002C220.368 552.667 220.648 551.379 220.927 550.137C221.036 549.734 221.113 549.33 221.222 548.927C221.408 548.12 221.595 547.344 221.781 546.599C221.795 546.538 221.795 546.474 221.781 546.413C221.951 545.73 222.138 545.062 222.308 544.442C222.495 543.759 222.681 543.122 222.852 542.517C223.457 540.344 224 538.606 224.404 537.473C224.404 537.302 224.497 537.163 224.543 537.023C224.59 536.883 224.714 536.557 224.761 536.387C224.807 536.216 224.869 536.092 224.885 536.03H221.905L233.871 486.505C233.871 486.505 277.886 472.243 297.503 473.344C298.232 473.344 298.915 473.438 299.567 473.531C299.893 473.531 300.219 473.624 300.514 473.67C301.037 473.755 301.555 473.869 302.066 474.012C302.716 474.166 303.346 474.395 303.944 474.695C304.286 474.857 304.613 475.049 304.921 475.269C305.1 475.392 305.266 475.533 305.418 475.688C305.569 475.821 305.71 475.966 305.837 476.123C306.097 476.432 306.302 476.784 306.442 477.162C306.533 477.35 306.6 477.548 306.644 477.752C306.985 479.183 307.426 480.589 307.963 481.958L308.351 482.905C308.615 483.603 308.941 484.317 309.283 485.062C309.469 485.497 309.686 485.931 309.903 486.397C310.509 487.654 311.176 488.942 311.89 490.261C315.262 496.196 318.94 501.951 322.909 507.504C324.228 509.428 325.47 511.198 326.572 512.734L327.394 513.867L328.683 515.636L329.738 517.049L330.141 517.592L330.328 517.84L330.84 518.508L331.104 518.849H325.144C335.077 526.392 366.52 540.018 366.52 540.018L363.603 542.176C392.718 553.397 497.851 549.191 499.247 549.144L497.695 549.78L493.536 551.426C494.56 551.565 495.585 551.705 496.64 551.876C501.048 552.61 505.376 553.759 509.568 555.306L512.191 556.314C513.479 556.842 514.752 557.385 515.978 557.96C524.575 561.896 532.516 567.13 539.522 573.48H531.87C537.675 576.584 548.942 592.585 559.465 608.881C564.121 616.222 568.699 623.594 572.455 629.864C578.337 639.657 582.388 646.749 582.388 646.749Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M582.388 646.749H147.44C145.844 644.265 144.845 641.444 144.522 638.508C144.522 638.213 144.522 637.903 144.445 637.608C144.367 637.313 144.445 637.003 144.445 636.708C144.445 636.413 144.445 636.103 144.445 635.792C144.462 635.148 144.519 634.505 144.615 633.868C144.615 633.62 144.615 633.371 144.755 633.138C144.895 632.906 144.879 632.564 144.941 632.3C145.008 631.996 145.09 631.695 145.19 631.4C145.357 630.828 145.565 630.267 145.81 629.724C145.919 629.46 146.043 629.181 146.167 628.917L146.586 628.125L147.052 627.365C147.376 626.859 147.728 626.372 148.107 625.906C148.294 625.658 148.495 625.44 148.697 625.208L149.194 624.664L150.296 623.656C150.683 623.33 151.087 623.024 151.506 622.74C151.848 622.489 152.205 622.261 152.577 622.057H152.67L153.695 621.498L154.083 621.328C154.501 621.121 154.931 620.94 155.371 620.784C155.759 620.629 156.178 620.474 156.597 620.35C168.594 616.656 201.512 619.636 205.268 619.636C205.492 619.631 205.713 619.584 205.919 619.496C208.263 618.565 211.801 613.133 214.285 608.85L214.688 608.151C216.116 605.668 217.125 603.697 217.233 603.495H213.555C214.563 601.634 215.475 599.723 216.287 597.768C216.582 597.054 216.861 596.325 217.125 595.611C217.264 595.285 217.373 594.975 217.482 594.649C217.59 594.323 217.777 593.826 217.916 593.407C218.397 591.948 218.816 590.52 219.189 589.186C219.375 588.518 219.546 587.851 219.701 587.215C219.856 586.578 219.996 585.973 220.12 585.368C220.244 584.763 220.353 584.359 220.446 583.816C220.539 583.273 220.586 583.086 220.632 582.76C220.788 582.031 220.896 581.379 220.989 580.805C220.989 580.541 221.067 580.293 221.098 580.06L221.191 579.47C221.191 579.284 221.191 579.129 221.191 578.974C221.191 578.818 221.191 578.679 221.191 578.555C221.191 578.135 221.191 577.903 221.191 577.903H218.444C218.351 577.111 218.289 576.351 218.242 575.513V574.426C218.242 574.131 218.242 573.821 218.242 573.526C218.242 572.641 218.242 571.741 218.242 570.841C218.242 570.251 218.242 569.662 218.242 569.056C218.242 568.451 218.242 568.032 218.335 567.504C218.428 566.977 218.335 566.946 218.335 566.651C218.444 565.192 218.584 563.748 218.77 562.321C218.77 561.84 218.894 561.358 218.956 560.877C219.018 560.396 219.08 559.946 219.158 559.465C219.298 558.534 219.453 557.603 219.608 556.687C219.763 555.771 219.934 554.871 220.105 553.986C220.368 552.652 220.648 551.363 220.927 550.122C221.036 549.718 221.113 549.315 221.222 548.911C221.408 548.104 221.595 547.328 221.781 546.583C221.795 546.522 221.795 546.458 221.781 546.397C221.951 545.714 222.138 545.047 222.308 544.426C222.495 543.743 222.681 543.107 222.852 542.502C223.472 540.329 224.016 538.591 224.404 537.458C224.404 537.287 224.497 537.147 224.543 537.008C224.59 536.868 224.714 536.542 224.761 536.371C224.807 536.2 224.869 536.076 224.885 536.014H221.889L233.855 486.49C233.855 486.49 277.87 472.227 297.487 473.329C298.217 473.329 298.9 473.422 299.552 473.515C299.877 473.515 300.203 473.608 300.498 473.655C301.021 473.74 301.54 473.854 302.05 473.996C302.701 474.15 303.331 474.379 303.928 474.679C304.27 474.842 304.597 475.034 304.906 475.253C305.085 475.377 305.251 475.517 305.403 475.672C305.554 475.806 305.694 475.951 305.822 476.107C306.082 476.416 306.287 476.768 306.427 477.147C306.507 477.332 306.57 477.524 306.613 477.721C306.952 479.16 307.398 480.571 307.948 481.943C308.06 482.265 308.189 482.581 308.336 482.889C308.6 483.588 308.926 484.302 309.267 485.047C309.453 485.481 309.671 485.916 309.888 486.381C310.493 487.638 311.16 488.927 311.874 490.246C315.251 496.186 318.934 501.946 322.909 507.504C324.228 509.428 325.47 511.198 326.572 512.734L327.394 513.867L328.683 515.636L329.738 517.049L330.141 517.592L330.328 517.84C330.529 518.104 330.716 518.321 330.84 518.508L331.104 518.849H325.144C335.077 526.392 366.52 540.018 366.52 540.018L363.603 542.176C392.718 553.397 497.851 549.191 499.247 549.144L497.695 549.78L493.536 551.426C494.56 551.55 495.585 551.689 496.64 551.876C501.048 552.61 505.376 553.759 509.568 555.306L512.191 556.314C513.479 556.842 514.752 557.385 515.978 557.96C524.575 561.896 532.516 567.13 539.522 573.48H531.87C537.675 576.584 548.942 592.585 559.465 608.881C564.121 616.222 568.699 623.594 572.455 629.864C578.337 639.657 582.388 646.749 582.388 646.749Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.6"
                                    d="M298.605 501.886V519.532H294.337C294.337 519.532 288.967 543.96 290.814 552.295C290.814 552.295 288.486 551.255 286.81 545.171C286.81 545.171 276.365 571.384 268.186 578.415L267.673 573.759C267.673 573.759 255.708 609.455 284.575 646.78H270.452C262.924 640.836 254.497 630.717 247.094 613.568C228.113 569.553 232.629 552.326 232.629 552.326L228.392 554.576L234.6 529.558H230.115C230.115 529.558 230.472 504.353 243.416 497.618C256.359 490.882 298.605 501.886 298.605 501.886Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.1"
                                    d="M322.909 513.386C321.639 515.375 320.068 517.155 318.253 518.663L316.437 516.397C315.491 522.946 308.957 532.693 308.957 532.693L306.97 530.598L305.666 534.773C291.559 535.192 262.21 524.747 262.21 524.747L262.49 528.099C255.059 524.551 248.539 519.35 243.428 512.894C238.317 506.437 234.75 498.898 233.002 490.851C233.002 490.851 285.273 489.609 312.154 490.246C315.304 498.099 319.371 506.48 322.909 513.386Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M363.323 646.749H147.44C141.232 637.158 144.584 623.951 156.597 620.272C168.609 616.594 201.512 619.558 205.268 619.558C209.023 619.558 217.28 603.433 217.28 603.433H213.555C217.657 595.459 220.286 586.811 221.315 577.903H218.568C218.203 574.167 218.172 570.407 218.475 566.666C219.282 570.376 220.027 572.874 220.027 572.874L221.362 568.451C221.16 575.249 226.282 589.558 226.282 589.558L228.082 584.111C231.403 605.559 246.954 613.599 246.954 613.599L247.28 609.703C253.24 614.142 266.168 616.361 266.168 616.361C265.858 607.049 270.638 596.077 270.638 596.077H267.767C273.881 578.306 285.568 571.136 285.568 571.136C285.568 571.136 353.468 582.326 362.051 606.506C367.56 621.855 365.527 637.468 363.323 646.749Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M478.094 592.476C478.094 592.476 456.986 591.328 444.089 592.476C431.192 593.624 409.588 606.584 410.085 617.479C410.582 628.374 436.391 635.87 436.391 635.87C436.391 635.87 405.119 628.839 395.931 629.46C386.743 630.081 383.98 646.749 383.98 646.749H374.187C374.187 646.749 370.416 628.125 377.959 621.747C385.501 615.368 402.651 621.747 402.651 621.747C402.651 621.747 399.811 598.467 417.193 587.836L416.991 592.492C416.991 592.492 427.948 582.745 451.306 583.086C451.306 583.086 446.216 586.842 447.209 586.501C448.202 586.159 456.381 584.514 478.094 592.476Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M572.455 629.864C571.415 636.196 566.992 642.093 560.613 646.749H497.137C480.22 634.877 479.599 621.467 479.599 621.467L484.736 623.78C481.027 610.759 483.743 592.476 483.743 592.476C492.062 601.152 526.78 608.741 527.851 608.974C526.873 608.26 502.584 590.521 520.556 600.779C522.156 601.698 523.804 602.532 525.492 603.278C538.979 609.16 553.645 609.16 559.465 608.881C564.152 616.222 568.699 623.594 572.455 629.864Z"
                                    fill="black"
                                />
                                <path
                                    d="M268.791 424.022C268.791 424.022 280.912 390.25 301.088 380.969C304.533 379.417 314.094 427.017 298.155 447.705C296.975 449.32 268.791 424.022 268.791 424.022Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M306.784 421.042C306.486 425.121 305.831 429.167 304.828 433.132C303.613 438.408 301.349 443.385 298.17 447.768C296.991 449.32 268.775 424.022 268.775 424.022C268.775 424.022 280.912 390.25 301.088 380.985C303.385 379.914 308.46 400.897 306.784 421.042Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.6"
                                    d="M300.809 384.896C300.809 384.896 286.499 412.242 297.953 427.095C309.205 441.73 308.32 395.263 300.809 384.896Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.1"
                                    d="M306.784 421.042C306.486 425.121 305.831 429.167 304.828 433.132C297.767 431.425 288.765 427.002 280.074 418.512C280.074 418.512 291.233 414.182 306.784 421.042Z"
                                    fill="black"
                                />
                                <path
                                    d="M346.375 464.327C343.97 459.547 325.734 456.567 325.734 456.567C325.734 456.567 325.408 445.61 320.659 438.688C315.91 431.766 295.516 419.319 283.302 418.621C271.088 417.923 245.123 421.958 245.123 421.958L227.073 459.314C227.073 459.314 227.073 459.532 227.073 459.935C225.267 465.449 224.309 471.205 224.233 477.007L225.614 475.719C225.614 475.719 224.59 486.692 228.641 493.862L230.053 492.31C232.051 495.352 234.489 498.082 237.285 500.411C242.143 504.819 249.701 508.839 262.971 510.344C278.491 512.098 297.27 517.468 308.724 517.049C334.44 516.118 335.775 490.479 335.775 490.479C349.526 491.146 348.781 469.092 346.375 464.327Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M335.713 490.432C335.713 490.432 334.378 516.071 308.662 517.002C297.208 517.421 278.367 512.051 262.909 510.298C249.686 508.746 242.081 504.772 237.223 500.365C234.428 498.03 231.986 495.301 229.975 492.263L228.579 493.815C224.528 486.63 225.475 475.657 225.475 475.657L224.109 476.945C224.188 471.144 225.145 465.388 226.949 459.873C226.949 459.47 226.949 459.252 226.949 459.252L244.999 421.896L246.333 421.694C247.637 421.508 249.888 421.182 252.65 420.825C261.264 419.676 275.185 418.109 283.178 418.559C295.392 419.257 315.77 431.596 320.535 438.626C323.887 443.515 325.035 450.421 325.423 454.053C325.579 455.605 325.61 456.505 325.61 456.505C325.61 456.505 343.846 459.516 346.267 464.265C348.688 469.014 349.526 491.146 335.713 490.432Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.6"
                                    d="M342.992 487.856C342.023 488.779 340.869 489.485 339.606 489.927C338.342 490.368 336.999 490.535 335.667 490.416C335.667 490.416 334.782 507.411 320.566 514.224C316.82 515.972 312.748 516.914 308.615 516.987C297.161 517.406 278.32 512.036 262.862 510.282C249.639 508.73 242.034 504.757 237.177 500.349C237.906 496.888 239.427 490.96 241.926 487.142L238.108 487.297C238.108 487.297 236.323 479.397 255.04 475.486C273.757 471.575 288.067 462.868 292.474 458.29C296.882 453.712 294.725 436.562 292.071 433.706C289.417 430.851 283.907 429.128 285.273 427.281C286.639 425.434 295.02 430.696 298.031 436.267C301.041 441.839 306.924 454.689 309.174 456.195C314.681 456.033 320.192 456.147 325.687 456.536C325.687 456.536 343.923 459.547 346.344 464.296C348.238 468.006 349.107 481.989 342.992 487.856Z"
                                    fill="white"
                                />
                                <path
                                    d="M279.67 453.619C279.05 457.017 276.365 459.314 273.664 458.771C270.964 458.228 269.241 455.046 269.831 451.632C270.42 448.218 273.121 445.874 275.852 446.417C278.584 446.96 280.291 450.189 279.67 453.619Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M319.805 447.721C320.628 451.12 319.324 454.348 316.903 454.953C314.482 455.559 311.859 453.324 311.036 449.94C310.214 446.557 311.486 443.282 313.923 442.661C316.36 442.041 318.998 444.322 319.805 447.721Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M344.839 464.048C339.64 460.137 328.869 461.627 325.346 467.276C322.412 471.932 338.119 478.14 338.119 478.14C338.119 478.14 348.548 466.888 344.839 464.048Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.1"
                                    d="M342.992 487.856C342.023 488.779 340.869 489.485 339.606 489.927C338.342 490.368 336.999 490.535 335.667 490.416C335.667 490.416 334.782 507.411 320.566 514.224C302.935 512.377 293.592 497.152 293.592 497.152C312.635 500.567 335.698 487.84 335.698 487.84C336.815 488.445 338.066 488.761 339.337 488.761C340.608 488.761 341.859 488.445 342.976 487.84L342.992 487.856Z"
                                    fill="black"
                                />
                                <path
                                    d="M339.034 489.563C337.732 489.49 336.48 489.037 335.434 488.259C335.373 488.22 335.32 488.168 335.28 488.108C335.24 488.047 335.213 487.979 335.2 487.907C335.188 487.836 335.19 487.762 335.207 487.692C335.224 487.621 335.256 487.555 335.3 487.497C335.343 487.439 335.399 487.391 335.462 487.355C335.526 487.32 335.596 487.298 335.668 487.291C335.741 487.284 335.814 487.291 335.883 487.314C335.952 487.336 336.016 487.373 336.07 487.421C337.071 488.165 338.302 488.534 339.547 488.461C339.615 488.447 339.685 488.448 339.753 488.461C339.822 488.475 339.886 488.502 339.944 488.541C340.002 488.58 340.051 488.63 340.09 488.688C340.128 488.746 340.154 488.812 340.167 488.88C340.181 488.948 340.181 489.019 340.167 489.087C340.153 489.155 340.126 489.22 340.087 489.278C340.048 489.335 339.998 489.385 339.94 489.423C339.882 489.461 339.817 489.488 339.748 489.501C339.513 489.544 339.274 489.565 339.034 489.563Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M331.678 490.432C331.678 490.432 331.476 506.992 316.515 507.007C307.917 507.007 298.015 498.533 298.015 498.533C309.569 497.476 320.908 494.747 331.678 490.432Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M305.744 498.518C309.286 504.079 313.366 509.277 317.927 514.038C324.368 520.494 332.128 510.608 323.887 493.536C317.964 495.621 311.901 497.286 305.744 498.518Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M300.017 498.921C298.107 498.996 296.201 498.706 294.399 498.068L293.545 497.726C291.747 497.2 290.072 496.318 288.622 495.131C287.171 493.945 285.974 492.479 285.102 490.82C285.041 490.692 285.032 490.546 285.079 490.412C285.125 490.278 285.223 490.168 285.351 490.106C285.478 490.044 285.625 490.036 285.759 490.082C285.893 490.129 286.003 490.227 286.065 490.354C286.884 491.889 288.002 493.245 289.353 494.34C290.705 495.436 292.262 496.249 293.933 496.733L294.802 497.09C302.656 500.365 330.964 492.077 335.372 487.468C339.422 483.246 336.691 472.941 336.66 472.832C336.641 472.765 336.636 472.695 336.644 472.625C336.653 472.556 336.675 472.489 336.71 472.429C336.745 472.368 336.791 472.315 336.846 472.272C336.902 472.23 336.965 472.198 337.032 472.18C337.1 472.162 337.17 472.156 337.239 472.165C337.309 472.174 337.375 472.196 337.436 472.231C337.497 472.265 337.55 472.312 337.592 472.367C337.635 472.422 337.666 472.486 337.684 472.553C337.808 473.003 340.602 483.557 336.132 488.213C332.578 491.984 311.797 498.921 300.017 498.921Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M320.55 505.114C320.434 505.115 320.321 505.077 320.228 505.007C320.136 504.937 320.069 504.838 320.038 504.726C319.12 501.704 317.67 498.871 315.754 496.361C315.711 496.307 315.678 496.245 315.658 496.178C315.638 496.111 315.632 496.041 315.639 495.972C315.646 495.903 315.667 495.836 315.7 495.775C315.733 495.714 315.778 495.66 315.832 495.616C315.886 495.572 315.948 495.539 316.015 495.519C316.081 495.499 316.151 495.493 316.221 495.5C316.29 495.507 316.357 495.528 316.418 495.561C316.479 495.594 316.533 495.639 316.577 495.693C318.592 498.308 320.112 501.27 321.062 504.431C321.101 504.569 321.083 504.716 321.013 504.841C320.943 504.966 320.827 505.059 320.69 505.098L320.55 505.114Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.1"
                                    d="M252.774 420.856C252.693 422.786 252.128 424.665 251.129 426.319L246.473 421.663C247.761 421.539 250.012 421.213 252.774 420.856Z"
                                    fill="black"
                                />
                                <path
                                    d="M251.145 426.319C251.145 426.319 242.826 393.727 222.526 382.273C213.943 377.415 214.285 453.091 232.815 468.13C251.005 482.874 251.145 426.319 251.145 426.319Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M251.145 426.319C251.145 426.319 242.826 393.727 222.526 382.273C213.943 377.415 214.285 453.091 232.815 468.13C251.005 482.874 251.145 426.319 251.145 426.319Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.6"
                                    d="M223.084 385.982C223.721 383.515 238.604 413.406 240.669 430.82C242.686 447.892 230.255 459.082 230.255 459.082C230.255 459.082 211.677 431.021 223.084 385.982Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M324.57 482.672C324.57 482.829 324.523 482.982 324.436 483.112C324.349 483.242 324.226 483.343 324.081 483.403C323.937 483.463 323.777 483.479 323.624 483.448C323.47 483.418 323.329 483.342 323.219 483.232C323.108 483.121 323.032 482.98 323.002 482.826C322.971 482.673 322.987 482.514 323.047 482.369C323.107 482.225 323.208 482.101 323.338 482.014C323.469 481.927 323.622 481.88 323.778 481.88C323.988 481.88 324.189 481.964 324.338 482.112C324.486 482.261 324.57 482.462 324.57 482.672Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M343.659 485.962C343.442 486.335 343.163 486.568 343.023 486.49C342.883 486.412 342.93 486.04 343.147 485.667C343.364 485.295 343.659 485.047 343.799 485.124C343.939 485.202 343.877 485.574 343.659 485.962Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M346.95 478.606C346.95 479.04 346.717 479.366 346.562 479.351C346.406 479.335 346.313 478.963 346.36 478.528C346.406 478.094 346.593 477.768 346.748 477.783C346.903 477.799 346.996 478.171 346.95 478.606Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M343.116 481.12C343.116 481.555 342.883 481.896 342.728 481.865C342.573 481.834 342.464 481.477 342.526 481.058C342.588 480.639 342.744 480.282 342.914 480.313C343.085 480.344 343.163 480.716 343.116 481.12Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M320.348 487.84C320.348 487.997 320.302 488.15 320.215 488.28C320.128 488.41 320.004 488.512 319.86 488.571C319.715 488.631 319.556 488.647 319.402 488.616C319.249 488.586 319.108 488.511 318.997 488.4C318.886 488.289 318.811 488.148 318.78 487.995C318.75 487.841 318.766 487.682 318.826 487.537C318.885 487.393 318.987 487.269 319.117 487.182C319.247 487.095 319.4 487.049 319.557 487.049C319.767 487.049 319.968 487.132 320.116 487.28C320.265 487.429 320.348 487.63 320.348 487.84Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M316.996 481.12C316.96 481.299 316.863 481.461 316.722 481.576C316.58 481.692 316.403 481.756 316.22 481.756C316.037 481.756 315.86 481.692 315.718 481.576C315.577 481.461 315.48 481.299 315.444 481.12C315.48 480.941 315.577 480.779 315.718 480.664C315.86 480.548 316.037 480.484 316.22 480.484C316.403 480.484 316.58 480.548 316.722 480.664C316.863 480.779 316.96 480.941 316.996 481.12Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M311.905 487.576C312.343 487.576 312.697 487.222 312.697 486.785C312.697 486.348 312.343 485.993 311.905 485.993C311.468 485.993 311.114 486.348 311.114 486.785C311.114 487.222 311.468 487.576 311.905 487.576Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M307.762 490.432C307.726 490.611 307.629 490.773 307.487 490.888C307.346 491.004 307.168 491.068 306.986 491.068C306.803 491.068 306.626 491.004 306.484 490.888C306.343 490.773 306.246 490.611 306.21 490.432C306.246 490.253 306.343 490.091 306.484 489.976C306.626 489.86 306.803 489.796 306.986 489.796C307.168 489.796 307.346 489.86 307.487 489.976C307.629 490.091 307.726 490.253 307.762 490.432Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M299.645 487.84C300.082 487.84 300.436 487.486 300.436 487.049C300.436 486.612 300.082 486.257 299.645 486.257C299.208 486.257 298.853 486.612 298.853 487.049C298.853 487.486 299.208 487.84 299.645 487.84Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M306.97 482.672C306.97 482.882 306.887 483.083 306.738 483.232C306.59 483.38 306.388 483.464 306.179 483.464C305.999 483.428 305.838 483.331 305.722 483.189C305.606 483.048 305.543 482.87 305.543 482.688C305.543 482.505 305.606 482.327 305.722 482.186C305.838 482.045 305.999 481.948 306.179 481.912C306.383 481.911 306.58 481.99 306.728 482.132C306.875 482.274 306.962 482.468 306.97 482.672Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M325.734 456.536C325.734 456.536 306.504 455.233 298.015 458.088C298.015 458.088 305.682 451.88 325.548 454.115C325.703 455.59 325.734 456.536 325.734 456.536Z"
                                    fill="black"
                                />
                                <path
                                    d="M288.408 564.416C288.408 564.416 274.766 581.767 273.478 593.904H276.582C273.622 602.241 272.515 611.123 273.338 619.931C273.338 619.931 262.474 620.428 247.792 619.589C222.96 618.162 214.828 627.877 222.634 646.812H337.855C337.855 646.812 347.772 637.794 347.586 631.835L348.424 639.688C348.424 639.688 362.749 623.842 362.485 610.045C362.221 596.247 339.143 528.549 288.408 564.416Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M362.47 609.936C362.733 623.733 348.409 639.579 348.409 639.579L347.57 631.742C347.757 637.686 337.839 646.703 337.839 646.703H222.619C214.859 627.768 222.929 618.053 247.777 619.481C262.474 620.319 273.323 619.807 273.323 619.807C272.501 611.003 273.607 602.127 276.566 593.795H273.462C274.751 581.721 288.393 564.307 288.393 564.307C339.143 528.549 362.19 596.185 362.47 609.936Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.1"
                                    d="M273.323 619.869C288.051 619.434 297.41 625.052 298.512 630.733C298.512 630.733 295.765 621.84 292.987 619.869H297.363C293.346 616.7 288.339 615.052 283.224 615.213C281.328 615.181 279.449 615.584 277.733 616.391C276.017 617.198 274.508 618.388 273.323 619.869Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M234.352 646.749H230.581C230.581 646.749 223.86 635.078 229.82 628.591C229.851 629.274 229.292 640.976 234.352 646.749Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M248.134 646.749H242.81C242.484 646.129 237.378 636.041 241.957 630.671C241.957 630.671 242.112 641.1 248.134 646.749Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M264.073 646.749H259.184C259.184 646.749 262.893 643.025 261.217 640.309C261.14 640.309 265.873 641.1 264.073 646.749Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.1"
                                    d="M558.953 612.668C559.667 612.668 560.381 612.543 561.095 612.466C560.126 612.738 559.114 612.818 558.115 612.699L558.953 612.668Z"
                                    fill="black"
                                />
                                <path
                                    d="M619.838 627.924L614.452 624.261C614.452 624.261 620.303 641.1 603.48 646.749H507.706C506.464 646.16 491.689 638.772 489.175 622.693C489.175 622.693 490.929 624.975 495.926 625.549C492.236 619.875 489.753 613.502 488.632 606.827C487.511 600.152 487.775 593.318 489.408 586.749C489.408 586.749 503.376 598.855 520.075 603.387L518.027 596.123C519.829 597.643 521.71 599.067 523.66 600.391C523.971 600.624 524.312 600.857 524.669 601.09C526.221 602.145 528.037 603.293 530.023 604.426C530.396 604.659 530.784 604.876 531.187 605.094L531.917 605.482C532.289 605.699 532.677 605.901 533.065 606.087C533.717 606.444 534.385 606.785 535.067 607.096L536.619 607.856C537.039 608.043 537.458 608.244 537.877 608.4C538.684 608.756 539.506 609.098 540.344 609.408C540.825 609.595 541.322 609.781 541.819 609.936C542.315 610.091 542.657 610.246 543.076 610.371L543.355 610.479L544.442 610.805H544.535C546.296 611.324 548.083 611.749 549.889 612.078L550.991 612.264L551.534 612.342L552.574 612.466C552.821 612.507 553.069 612.533 553.319 612.543C553.769 612.543 554.204 612.621 554.638 612.652C555.775 612.722 556.916 612.722 558.053 612.652H558.891C559.605 612.652 560.319 612.528 561.032 612.45L554.545 601.509C560.159 594.962 568.116 590.878 576.708 590.132L574.814 596.496C574.814 596.496 594.385 591.948 608.182 603.604C621.979 615.259 619.838 627.924 619.838 627.924Z"
                                    fill="#407BFF"
                                />
                                <path
                                    opacity="0.3"
                                    d="M619.838 627.924L614.452 624.261C614.452 624.261 620.303 641.1 603.48 646.749H507.706C506.464 646.16 491.689 638.772 489.175 622.693C489.175 622.693 490.929 624.975 495.926 625.549C492.236 619.875 489.753 613.502 488.632 606.827C487.511 600.152 487.775 593.318 489.408 586.749C489.408 586.749 503.376 598.855 520.075 603.387L518.027 596.123C519.829 597.643 521.71 599.067 523.66 600.391C523.971 600.624 524.312 600.857 524.669 601.09C526.221 602.145 528.037 603.293 530.023 604.426L531.187 605.094L531.917 605.482C532.289 605.699 532.677 605.885 533.065 606.087C533.717 606.444 534.385 606.785 535.067 607.096L536.619 607.856L537.877 608.4C538.684 608.756 539.506 609.098 540.344 609.408C540.825 609.595 541.322 609.781 541.819 609.936C542.315 610.091 542.657 610.246 543.076 610.371L543.355 610.479L544.442 610.805H544.535C546.296 611.324 548.083 611.749 549.889 612.078L550.991 612.264L551.534 612.342C551.876 612.342 552.233 612.45 552.574 612.466C552.821 612.507 553.069 612.533 553.319 612.543C553.754 612.543 554.204 612.621 554.638 612.652C555.775 612.722 556.916 612.722 558.053 612.652H558.891C559.605 612.652 560.319 612.528 561.032 612.45L554.545 601.509C560.159 594.962 568.116 590.878 576.708 590.132L574.814 596.496C574.814 596.496 594.385 591.948 608.182 603.604C621.979 615.259 619.838 627.924 619.838 627.924Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.1"
                                    d="M574.023 605.156C569.817 611.597 561.095 612.466 561.095 612.466L554.607 601.524C565.223 597.396 571.679 602.316 571.679 602.316C572.576 601.41 573.172 600.25 573.386 598.994C573.386 598.994 578.213 598.746 574.023 605.156Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.6"
                                    d="M557.835 634.085C557.835 634.085 553.878 640.386 530.458 637.825C533.114 639.81 536.161 641.206 539.398 641.923C539.398 641.923 536.806 644.872 530.179 646.749H507.706C506.464 646.16 491.689 638.772 489.175 622.693C489.175 622.693 490.929 624.975 495.926 625.549C492.236 619.875 489.753 613.502 488.632 606.827C487.511 600.152 487.775 593.318 489.408 586.749C489.408 586.749 503.376 598.855 520.075 603.387L518.027 596.123C518.027 596.123 529.899 606.475 544.597 610.836C546.775 613.296 549.411 615.31 552.357 616.765C552.357 616.765 542.129 617.292 536.992 614.933C536.992 614.918 539.18 628.048 557.835 634.085Z"
                                    fill="white"
                                />
                                <path
                                    d="M438.781 479.133C438.781 479.133 461.254 492.465 461.798 501.327C461.798 501.327 541.105 545.947 515.342 646.749H398.383C398.383 646.749 382.475 610.479 393.727 587.292L392.718 587.463C396.458 581.783 399.516 582.652 399.516 582.652C399.516 582.652 403.148 539.739 401.72 527.323C400.292 514.907 393.727 487.825 393.727 487.825L438.781 479.133Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.2"
                                    d="M520.494 608.57C520.494 609.517 520.494 610.464 520.494 611.441C520.327 617.272 519.809 623.087 518.942 628.855L518.57 631.354C517.783 636.33 516.713 641.462 515.357 646.749H398.383C398.383 646.749 396.94 643.444 395.279 638.167C393.184 631.874 391.627 625.416 390.623 618.86C389.071 608.399 389.071 596.759 393.727 587.292L392.718 587.463C395.139 583.785 397.281 582.807 398.492 582.652C398.835 582.582 399.188 582.582 399.531 582.652C399.531 582.652 399.718 580.308 400.012 576.552C400.944 564.245 402.822 536.837 401.72 527.323C401.347 524.064 400.618 519.796 399.733 515.264C397.312 502.553 393.727 487.825 393.727 487.825L438.828 479.133C438.828 479.133 440.69 480.235 443.344 482.02C449.428 486.102 459.718 493.707 461.549 499.837C461.717 500.339 461.816 500.861 461.844 501.389C461.844 501.389 462.651 501.855 464.064 502.755C467.729 505.135 471.253 507.726 474.617 510.515C475.874 511.586 477.209 512.734 478.575 513.96C482.574 517.573 486.353 521.424 489.889 525.492C491.146 526.951 492.434 528.487 493.691 530.148C497.116 534.472 500.258 539.013 503.096 543.743C504.307 545.761 505.471 547.84 506.604 549.951C509.596 555.639 512.119 561.561 514.147 567.66C514.659 569.212 515.14 570.764 515.574 572.316C517.074 577.463 518.23 582.705 519.035 588.006C519.237 589.294 519.408 590.583 519.563 591.886C520.227 597.422 520.538 602.995 520.494 608.57Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M416.076 496.826C416.076 496.826 407.881 503.702 407.183 508.032L405.305 506.992C405.305 506.992 405.895 519.237 404.824 526.081L403.551 522.683C403.573 527.777 403.131 532.862 402.232 537.877C402.154 533.764 401.984 530.117 401.673 527.323C400.245 514.907 393.68 487.825 393.68 487.825L399.066 486.785C404.902 489.842 410.579 493.193 416.076 496.826Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M443.298 482.02C441.528 487.592 436.64 499.713 426.722 504.136V502.584C421.548 504.742 416.688 507.587 412.273 511.043L412.972 507.038C408.066 508.943 403.56 511.748 399.687 515.311C397.265 502.6 393.68 487.871 393.68 487.871L438.781 479.18C438.781 479.18 440.644 480.235 443.298 482.02Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M399.485 582.652H398.445C398.788 582.582 399.142 582.582 399.485 582.652Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M423.929 603.231C423.929 603.231 413.36 586.082 399.485 582.652C399.485 582.652 399.671 580.308 399.966 576.552C401.739 576.329 403.532 576.329 405.305 576.552L408.936 563.004C412.723 560.769 418.481 549.33 418.481 549.33V552.512C423.277 548.834 421.213 535.642 421.213 535.642C424.317 540.096 422.315 552.512 422.315 552.512L421.213 549.253C421.213 549.253 421.601 554.157 416.076 558.379C410.551 562.6 411.699 573.697 411.699 573.697C419.288 582.667 423.929 603.231 423.929 603.231Z"
                                    fill="black"
                                />
                                <g opacity="0.4">
                                    <path
                                        d="M404.824 537.877C405.475 538.075 406.16 538.136 406.836 538.056C407.512 537.976 408.164 537.756 408.75 537.411C409.953 536.72 411.114 535.958 412.227 535.13C413.418 534.283 414.705 533.58 416.06 533.034C417.432 532.459 418.938 532.281 420.406 532.522C417.685 533.192 415.142 534.447 412.956 536.2C411.78 537.074 410.497 537.794 409.138 538.342C408.785 538.488 408.415 538.587 408.036 538.637C407.655 538.692 407.269 538.692 406.888 538.637C406.506 538.597 406.13 538.508 405.77 538.373C405.443 538.231 405.127 538.065 404.824 537.877Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M406.764 528.223C408.038 527.792 409.16 526.999 409.992 525.942C410.908 524.948 411.808 523.893 412.785 522.838C413.781 521.801 414.934 520.926 416.2 520.246C417.481 519.534 418.984 519.334 420.406 519.687C419.073 519.841 417.802 520.333 416.712 521.115C415.633 521.905 414.626 522.788 413.701 523.753C412.741 524.761 411.731 525.719 410.675 526.625C410.166 527.144 409.557 527.554 408.885 527.829C408.212 528.103 407.49 528.238 406.764 528.223Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M418.497 539.273C416.753 541.451 414.85 543.495 412.801 545.388C411.756 546.349 410.618 547.202 409.402 547.934C408.208 548.771 406.758 549.161 405.305 549.036C406.609 548.659 407.812 547.996 408.828 547.096C409.883 546.257 410.908 545.342 411.932 544.426C412.956 543.51 413.981 542.579 415.036 541.71C416.11 540.791 417.269 539.975 418.497 539.273Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M403.52 588.922C401.671 590.383 400.255 592.32 399.423 594.525C398.437 596.67 397.582 598.872 396.862 601.121C396.117 603.356 395.465 605.621 394.906 607.918C394.323 610.224 393.903 612.568 393.649 614.933C393.398 612.533 393.482 610.109 393.898 607.732C394.297 605.348 394.878 602.997 395.636 600.702C396.381 598.397 397.353 596.171 398.538 594.059C398.833 593.531 399.174 593.019 399.5 592.507C399.826 591.995 400.23 591.529 400.602 591.048C401.374 590.098 402.379 589.365 403.52 588.922Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M399.485 628.451C399.757 625.832 400.229 623.238 400.897 620.691C401.547 618.152 402.377 615.663 403.38 613.242C404.368 610.787 405.661 608.467 407.229 606.335C408.692 604.085 410.965 602.485 413.577 601.866C411.238 602.913 409.3 604.687 408.052 606.925C406.697 609.091 405.534 611.371 404.575 613.738C403.567 616.113 402.697 618.534 401.875 620.971C401.052 623.407 400.245 625.953 399.485 628.451Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M409.076 638.027C409.893 634.071 411.475 630.312 413.732 626.961C414.861 625.244 416.207 623.679 417.736 622.305C419.272 620.976 421.062 619.972 422.998 619.357C421.33 620.401 419.793 621.641 418.419 623.05C417.1 624.477 415.891 626.003 414.803 627.613C413.716 629.238 412.711 630.916 411.792 632.642C410.83 634.458 409.914 636.211 409.076 638.027Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M439.526 486.785C448.316 496.259 456.266 506.479 463.288 517.328C466.795 522.76 470.085 528.347 473.112 534.074C476.131 539.829 478.805 545.757 481.12 551.829C485.634 564.04 488.302 576.855 489.035 589.853C489.454 596.318 489.454 602.804 489.035 609.269C488.641 615.719 487.77 622.13 486.428 628.451C487.267 622.07 487.713 615.643 487.763 609.207C487.869 602.799 487.625 596.39 487.033 590.008C486.456 583.643 485.487 577.32 484.131 571.074C483.836 569.522 483.401 567.97 483.013 566.418C482.625 564.866 482.284 563.314 481.772 561.762C480.81 558.658 479.909 555.678 478.668 552.714C474.059 540.759 468.344 529.26 461.596 518.368C454.88 507.407 447.51 496.86 439.526 486.785Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M443.298 499.48C440.795 500.629 438.535 502.246 436.64 504.245C434.847 506.241 433.356 508.489 432.216 510.918C430.975 513.34 429.982 515.931 428.926 518.539C427.941 521.225 426.726 523.821 425.295 526.299C425.807 523.474 426.288 520.712 427.002 517.949C427.673 515.138 428.641 512.407 429.888 509.801C431.173 507.12 433.002 504.736 435.258 502.801C437.526 500.883 440.337 499.722 443.298 499.48Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M448.714 509.522C447.071 509.986 445.572 510.856 444.353 512.051C443.115 513.204 441.974 514.454 440.939 515.792C438.866 518.489 436.988 521.331 435.32 524.297C433.598 527.245 432.046 530.303 430.571 533.407C429.097 536.511 427.793 539.692 426.536 542.983C426.781 539.455 427.507 535.977 428.693 532.646C429.817 529.307 431.262 526.085 433.008 523.024C434.767 519.93 436.899 517.063 439.356 514.488C440.602 513.183 442.004 512.037 443.531 511.074C445.054 510.028 446.867 509.485 448.714 509.522Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M457.623 522.605C456.259 523.008 455.02 523.75 454.022 524.762C452.965 525.695 451.974 526.701 451.058 527.773C449.2 529.904 447.469 532.143 445.874 534.478C444.322 536.806 442.77 539.134 441.342 541.632C439.914 544.131 438.595 546.568 437.4 549.129L435.522 553.024C434.808 554.328 434.094 555.6 433.287 556.827C431.735 559.248 429.966 561.576 428.228 563.842C426.497 566.051 424.94 568.391 423.572 570.841C422.154 573.299 421.345 576.061 421.213 578.896C420.798 575.985 421.19 573.017 422.346 570.313C423.496 567.634 424.91 565.077 426.567 562.678C428.119 560.256 429.78 557.944 431.223 555.523L432.279 553.723L433.272 551.876L435.072 548.027C437.566 542.779 440.648 537.833 444.26 533.283C446.063 531.001 448.04 528.864 450.173 526.888C451.244 525.904 452.391 525.007 453.603 524.204C454.772 523.315 456.162 522.762 457.623 522.605Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M465.91 537.877C463.07 538.708 460.411 540.066 458.073 541.881C455.769 543.643 453.685 545.675 451.865 547.934C450.025 550.191 448.379 552.6 446.945 555.135L444.881 559.046C444.182 560.381 443.5 561.731 442.755 563.035C441.203 565.673 439.651 568.218 438.021 570.795L432.961 578.182C431.263 580.572 429.798 583.118 428.585 585.787C427.421 588.506 426.764 591.414 426.645 594.369C426.226 591.351 426.48 588.277 427.39 585.368C428.345 582.469 429.637 579.693 431.239 577.096C434.343 571.912 437.648 567.023 440.551 561.824C441.311 560.551 441.994 559.248 442.692 557.944C443.391 556.64 444.136 555.275 444.896 553.971C446.48 551.349 448.326 548.894 450.406 546.645C452.496 544.405 454.889 542.467 457.514 540.888C460.053 539.27 462.922 538.241 465.91 537.877Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M474.136 559.403C468.89 560.64 463.901 562.783 459.392 565.735C457.201 567.189 455.195 568.904 453.417 570.841C452.951 571.307 452.579 571.85 452.16 572.393C451.741 572.936 451.337 573.402 450.903 573.945C450.064 575.047 449.18 576.118 448.28 577.158C444.601 581.302 440.52 584.995 436.671 588.751C434.73 590.594 432.925 592.576 431.27 594.68C429.524 596.728 428.471 599.276 428.259 601.959C427.943 599.154 428.63 596.328 430.199 593.981C431.655 591.622 433.328 589.403 435.196 587.354C438.859 583.242 442.801 579.501 446.324 575.451C447.209 574.442 448.078 573.433 448.9 572.347C449.304 571.85 449.754 571.291 450.22 570.795C450.658 570.249 451.13 569.73 451.632 569.243C453.609 567.217 455.867 565.487 458.337 564.105C463.151 561.296 468.569 559.683 474.136 559.403Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M477.473 578.896C472.877 580.192 468.43 581.966 464.203 584.188C462.157 585.298 460.218 586.597 458.414 588.068C457.554 588.815 456.745 589.618 455.993 590.474C455.621 590.862 455.217 591.343 454.798 591.84C454.379 592.336 453.96 592.771 453.51 593.221C449.899 596.54 445.921 599.435 441.653 601.85C439.62 603.123 437.555 604.349 435.646 605.746C434.679 606.416 433.78 607.181 432.961 608.027C432.117 608.858 431.507 609.896 431.192 611.038C431.254 609.792 431.674 608.59 432.403 607.577C433.103 606.554 433.915 605.612 434.824 604.768C436.623 603.098 438.525 601.543 440.52 600.112C444.439 597.461 448.153 594.519 451.632 591.312C452.051 590.908 452.439 590.489 452.827 590.07C453.215 589.651 453.588 589.201 454.038 588.72C454.891 587.777 455.82 586.905 456.816 586.113C458.804 584.599 460.967 583.328 463.256 582.326C467.753 580.344 472.567 579.183 477.473 578.896Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M478.761 601.928C474.655 601.916 470.565 602.438 466.593 603.48C462.661 604.54 458.82 605.915 455.108 607.592C451.306 609.144 447.519 610.805 443.81 612.543C441.963 613.428 440.132 614.328 438.378 615.384C437.5 615.891 436.66 616.462 435.864 617.091C435.47 617.397 435.11 617.746 434.793 618.131C434.444 618.504 434.203 618.966 434.094 619.465C434.141 618.377 434.595 617.347 435.367 616.579C436.057 615.765 436.82 615.016 437.648 614.344C439.288 613.011 441.032 611.812 442.863 610.759C446.48 608.647 450.24 606.791 454.115 605.202C456.055 604.426 457.964 603.65 459.997 602.968C462.027 602.322 464.102 601.829 466.205 601.493C470.374 600.753 474.653 600.901 478.761 601.928Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M478.761 619.434C475.176 619.76 471.622 619.993 468.068 620.21C464.514 620.427 461.006 620.691 457.499 621.064C455.745 621.204 453.991 621.405 452.253 621.654C450.515 621.902 448.792 622.166 447.069 622.492C443.593 623.043 440.248 624.226 437.198 625.984C438.403 624.599 439.856 623.451 441.482 622.6C443.112 621.754 444.816 621.058 446.572 620.521C450.053 619.476 453.631 618.79 457.25 618.472C460.861 618.136 464.491 618.042 468.114 618.193C471.691 618.316 475.252 618.731 478.761 619.434Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M464.048 502.693L462.651 502.119C460.199 501.172 457.731 500.256 455.108 499.48C457.256 499.28 459.422 499.4 461.534 499.837C461.701 500.339 461.801 500.861 461.829 501.389C461.829 501.389 462.605 501.793 464.048 502.693Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M478.528 513.96L475.859 512.92C471.804 511.384 467.609 510.246 463.334 509.522C467.109 509.247 470.903 509.583 474.571 510.515C475.828 511.586 477.162 512.734 478.528 513.96Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M493.645 530.086C491.984 529.061 490.308 528.068 488.601 527.137C484.008 524.57 479.161 522.489 474.136 520.929C476.799 521.144 479.429 521.665 481.974 522.481C484.546 523.25 487.062 524.199 489.501 525.321L489.842 525.476C491.099 526.951 492.388 528.487 493.645 530.086Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M506.573 549.982C506.293 549.687 505.999 549.423 505.688 549.144C502.017 545.701 497.828 542.857 493.272 540.717C488.585 538.648 483.737 536.967 478.776 535.688C483.999 535.954 489.151 537 494.064 538.792C496.538 539.731 498.914 540.911 501.156 542.315L503.065 543.619C504.276 545.73 505.44 547.856 506.573 549.982Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M515.543 572.316L513.045 570.065C512.067 569.212 510.965 568.513 509.941 567.706C508.916 566.899 507.799 566.263 506.712 565.533C505.626 564.831 504.501 564.189 503.345 563.609C498.723 561.108 493.753 559.314 488.601 558.285C494.008 558.34 499.341 559.546 504.245 561.824C507.765 563.382 511.081 565.368 514.116 567.737C514.628 569.212 515.109 570.748 515.543 572.316Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M519.532 591.886C518.973 591.328 518.368 590.831 517.763 590.334C517.056 589.668 516.304 589.051 515.512 588.487C512.428 586.089 509.054 584.086 505.471 582.528C501.843 580.902 498.042 579.694 494.141 578.927C498.235 578.688 502.334 579.269 506.2 580.634C510.118 581.948 513.789 583.904 517.064 586.423C517.716 586.935 518.352 587.479 518.973 587.975C519.206 589.294 519.377 590.583 519.532 591.886Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M520.494 608.57C520.494 609.517 520.494 610.464 520.494 611.441L520.044 611.162C519.299 610.697 518.492 610.262 517.747 609.843C517.002 609.424 516.195 608.974 515.435 608.601L513.06 607.437L510.624 606.382C509.072 605.699 507.349 605.078 505.673 604.52C502.29 603.369 498.817 602.502 495.29 601.928C498.921 601.493 502.601 601.714 506.154 602.58C509.758 603.37 513.247 604.617 516.537 606.289C517.871 607.003 519.206 607.763 520.494 608.57Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M518.927 628.855L518.554 631.354L517.344 630.779C515.947 630.096 514.519 629.476 513.076 628.901C510.204 627.66 507.24 626.667 504.26 625.611L495.228 622.507C498.449 622.522 501.659 622.881 504.804 623.578C507.984 624.253 511.1 625.203 514.116 626.418C515.714 627.21 517.359 627.986 518.927 628.855Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M504.897 646.749H501.42L498.782 643.832C497.23 642.078 495.678 640.293 494.126 638.384C496.271 639.487 498.29 640.82 500.148 642.357C501.841 643.698 503.428 645.166 504.897 646.749Z"
                                        fill="black"
                                    />
                                </g>
                                <path
                                    d="M447.69 458.119C455.031 440.039 445.315 420.204 445.315 420.204C436.4 423.168 428.453 428.487 422.315 435.6C417.169 434.889 411.988 434.474 406.795 434.358C404.389 429.299 397.607 417.643 385.268 415.144C385.268 415.144 377.959 437.54 383.996 449.894C381.517 453.149 379.241 456.554 377.183 460.09C372.806 467.85 377.928 478.714 381.839 484.721C385.75 490.727 397.095 498.316 408.362 499.527C424.813 501.28 443.096 489.454 446.883 482.781C448.838 479.258 450.53 468.549 447.69 458.119Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.2"
                                    d="M446.852 482.781C446.569 483.284 446.241 483.762 445.874 484.208C445.657 484.488 445.408 484.783 445.129 485.093C439.464 491.487 424.751 500.085 410.752 499.682C409.945 499.682 409.123 499.682 408.331 499.527C400.703 498.498 393.496 495.425 387.472 490.634C385.277 488.976 383.36 486.98 381.792 484.721C379.109 480.662 377.155 476.166 376.019 471.436C375.941 471.11 375.863 470.768 375.817 470.427C375.066 466.927 375.549 463.275 377.183 460.09C377.4 459.718 377.617 459.314 377.865 458.911C378.114 458.507 378.191 458.352 378.378 458.057C379.93 455.621 381.823 452.78 383.965 449.925C383.371 448.715 382.908 447.446 382.584 446.138C379.247 433.489 385.222 415.176 385.222 415.176C396.769 417.504 403.458 427.855 406.252 433.334C406.438 433.706 406.608 434.063 406.764 434.405H407.493C407.959 434.405 408.424 434.405 408.905 434.405C409.387 434.405 409.883 434.405 410.364 434.405H410.659C411.761 434.405 412.848 434.529 413.918 434.607H414.198C415.626 434.715 417.007 434.855 418.295 434.995H418.45L419.692 435.15C420.623 435.258 421.508 435.352 422.284 435.46C428.422 428.348 436.369 423.028 445.284 420.064C445.284 420.064 455 439.899 447.659 457.98C448.929 462.785 449.407 467.765 449.071 472.724C449.071 473.546 448.932 474.276 448.838 475.083C448.638 477.746 447.965 480.353 446.852 482.781Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M410.814 499.48C409.992 499.48 409.169 499.48 408.347 499.48C400.613 498.649 393.356 495.339 387.659 490.044C385.862 486.746 385.412 482.881 386.401 479.258L386.743 480.561C386.611 479.646 386.696 478.711 386.993 477.835C387.29 476.959 387.789 476.165 388.45 475.517V478.28C388.45 478.28 389.924 469.511 397.048 472.072L402.046 472.894C409.806 471.777 413.406 482.625 413.406 482.625L414.089 480.204C414.089 480.204 418.885 484.007 419.335 488.989L421.182 488.135C421.182 488.135 419.49 497.369 410.814 499.48Z"
                                    fill="white"
                                />
                                <path
                                    d="M423.292 465.29C423.013 468.394 421.104 470.799 419.04 470.613C416.976 470.427 415.501 467.757 415.781 464.638C416.06 461.518 417.954 459.128 420.033 459.299C422.113 459.47 423.572 462.17 423.292 465.29Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M395.372 461.487C394.627 464.591 392.392 466.609 390.359 466.143C388.326 465.678 387.255 462.775 388.047 459.733C388.838 456.692 391.042 454.612 393.06 455.077C395.077 455.543 396.117 458.445 395.372 461.487Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M394.984 471.886C395.922 471.303 397.031 471.056 398.128 471.186C399.225 471.315 400.245 471.814 401.021 472.6C402.077 473.484 397.917 476.542 397.917 476.542C397.917 476.542 394.068 473.189 394.984 471.886Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M405.957 485.9C402.542 485.9 397.902 483.789 397.25 482.532C396.396 480.872 397.172 474.866 397.25 473.67C397.277 473.51 397.364 473.366 397.494 473.267C397.624 473.169 397.787 473.125 397.948 473.143C398.111 473.166 398.257 473.252 398.356 473.383C398.455 473.514 398.498 473.679 398.476 473.841C398.119 476.449 397.747 480.949 398.259 481.958C398.771 482.967 404.467 485.45 407.322 484.472C407.741 484.317 409.03 483.867 408.611 481.368C408.597 481.288 408.6 481.205 408.618 481.126C408.637 481.047 408.671 480.972 408.719 480.905C408.766 480.839 408.826 480.783 408.896 480.74C408.965 480.697 409.042 480.668 409.123 480.654C409.203 480.641 409.286 480.644 409.365 480.662C409.445 480.681 409.52 480.715 409.586 480.762C409.652 480.81 409.708 480.87 409.751 480.94C409.795 481.009 409.823 481.086 409.837 481.167C410.349 484.271 408.688 485.31 407.664 485.652C407.112 485.826 406.535 485.909 405.957 485.9Z"
                                    fill="#263238"
                                />
                                <path
                                    d="M395.527 483.588C394.246 483.544 393.01 483.105 391.989 482.331C391.429 481.994 390.947 481.544 390.572 481.01C390.198 480.475 389.94 479.867 389.816 479.227C389.73 478.454 389.953 477.678 390.437 477.069C390.553 476.956 390.709 476.892 390.871 476.892C391.034 476.892 391.19 476.956 391.306 477.069C391.416 477.187 391.477 477.343 391.477 477.504C391.477 477.665 391.416 477.821 391.306 477.938C391.17 478.106 391.071 478.301 391.015 478.509C390.959 478.718 390.947 478.936 390.98 479.149C391.097 479.606 391.304 480.035 391.589 480.411C391.874 480.787 392.232 481.102 392.64 481.337C395.45 483.324 397.296 481.803 397.296 481.787C397.422 481.68 397.585 481.628 397.749 481.641C397.914 481.654 398.066 481.732 398.173 481.857C398.28 481.983 398.333 482.146 398.32 482.31C398.307 482.475 398.229 482.627 398.104 482.734C397.354 483.278 396.454 483.576 395.527 483.588Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.4"
                                    d="M448.869 475.222C446.448 472.631 440.318 468.207 425.295 464.902C425.295 464.902 442.165 465.926 449.102 472.863C449.04 473.686 448.963 474.477 448.869 475.222Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M403.085 460.152C403.085 460.54 403.892 443.996 410.69 434.498C411.792 434.498 412.879 434.622 413.949 434.7H414.229C408.585 442.202 404.77 450.917 403.085 460.152Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M423.913 441.637C423.913 441.637 433.784 427.203 444.276 422.315C446.918 427.679 448.403 433.54 448.633 439.516C448.863 445.492 447.833 451.45 445.61 457.002C445.61 457.002 438.44 455.45 436.298 452.346C436.298 452.346 437.928 448 440.954 446.448C438.953 447.033 437.125 448.099 435.631 449.552C435.631 449.552 436.748 442.382 439.573 439.03C439.573 439.03 434.094 442.956 432.682 448.342C432.589 448.388 425.248 445.89 423.913 441.637Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M422.315 435.6C421.626 436.933 421.045 438.319 420.576 439.744C419.446 438.425 418.718 436.809 418.481 435.088C419.894 435.289 421.197 435.445 422.315 435.6Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M385.175 449.025C385.175 449.025 390.421 443.655 393.354 442.118C393.354 442.118 391.073 437.742 390.111 437.338C391.569 437.878 392.9 438.713 394.022 439.79C394.022 439.79 393.556 435.134 391.663 432.837C393.721 434.741 395.387 437.03 396.567 439.573L401.223 436.764C398.402 428.621 392.939 421.656 385.703 416.976C385.703 416.976 379.107 437.012 385.175 449.025Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.2"
                                    d="M377.214 460.059C379.261 456.533 381.526 453.138 383.996 449.894C383.402 448.684 382.939 447.415 382.615 446.107C388.823 440.24 398.507 438.424 398.507 438.424C390.211 444.35 383.007 451.67 377.214 460.059Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M419.723 435.289C418.625 436.505 417.629 437.808 416.743 439.185C416.045 440.245 415.448 441.367 414.958 442.537C414.477 443.67 414.182 445.005 413.546 446.184C412.224 448.417 410.663 450.498 408.89 452.392C407.116 454.209 405.741 456.376 404.855 458.756C405.643 456.326 406.933 454.089 408.642 452.191C410.321 450.245 411.783 448.121 413.003 445.859C413.474 444.67 413.883 443.458 414.229 442.227C414.685 440.989 415.251 439.794 415.92 438.657C416.659 437.419 417.473 436.227 418.357 435.088H418.512L419.723 435.289Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M402.046 450.08C402.152 452.45 402.033 454.825 401.689 457.173C401.906 454.819 401.906 452.45 401.689 450.096C401.603 448.902 401.603 447.704 401.689 446.51C401.858 445.304 402.242 444.137 402.822 443.065C403.339 442.006 403.795 440.918 404.187 439.806C404.673 438.724 405.249 437.686 405.91 436.702C406.407 435.957 406.919 435.15 407.462 434.529C407.928 434.529 408.393 434.529 408.874 434.529C408.114 435.398 407.4 436.283 406.717 437.229C406.034 438.162 405.437 439.154 404.932 440.194C404.482 441.234 403.97 442.398 403.38 443.422C402.763 444.397 402.342 445.483 402.139 446.619C402.039 447.77 402.008 448.926 402.046 450.08Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M445.874 484.224C445.657 484.503 445.408 484.798 445.129 485.109C441.85 483.674 438.755 481.85 435.91 479.677C433.838 478.194 432.104 476.29 430.82 474.089C430.227 472.997 429.38 472.064 428.351 471.367C427.322 470.67 426.141 470.231 424.907 470.085C426.173 470.186 427.397 470.588 428.477 471.258C429.557 471.927 430.461 472.845 431.115 473.934C432.455 476.024 434.228 477.803 436.314 479.149C439.285 481.219 442.495 482.923 445.874 484.224Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M386.448 457.405C385.016 457.32 383.579 457.398 382.164 457.638C380.762 457.878 379.393 458.279 378.083 458.833H377.959C378.114 458.554 378.284 458.275 378.471 457.98C379.661 457.627 380.882 457.388 382.118 457.266C383.562 457.149 385.015 457.196 386.448 457.405Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.4"
                                    d="M385.144 463.163C383.528 463.588 382.052 464.428 380.861 465.6C379.66 466.752 378.564 468.009 377.586 469.356C377.043 470.039 376.531 470.737 376.034 471.42C375.956 471.094 375.879 470.753 375.832 470.411L377.089 468.937C378.176 467.643 379.37 466.444 380.659 465.352C381.94 464.248 383.486 463.494 385.144 463.163Z"
                                    fill="black"
                                />
                                <path
                                    opacity="0.2"
                                    d="M465.91 625.658C465.91 625.658 415.936 646.253 395.217 638.167C393.122 631.874 391.564 625.416 390.561 618.86C404.234 623.237 439.356 631.028 465.91 625.658Z"
                                    fill="black"
                                />
                                <path
                                    d="M471.808 621.933C471.808 621.933 403.52 645.942 371.58 619.139C333.261 586.997 366.924 545.202 358.667 537.877C350.411 530.551 338.926 530.706 333.835 555.306C328.745 579.905 331.585 646.749 398.321 646.749H479.987L471.808 621.933Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.2"
                                    d="M480.049 646.749H398.383C396.334 646.749 394.348 646.749 392.408 646.563C391.539 646.563 390.669 646.439 389.816 646.346C381.148 645.675 372.703 643.268 364.984 639.269C364.192 638.865 363.432 638.415 362.687 637.965C356.478 634.271 351.074 629.368 346.794 623.547C346.251 622.802 345.739 621.995 345.242 621.312C341.241 615.226 338.195 608.563 336.21 601.555C335.946 600.686 335.698 599.801 335.496 598.932C333.958 592.947 332.981 586.832 332.578 580.665C332.578 579.765 332.485 578.865 332.438 577.98C332.22 573.125 332.339 568.261 332.795 563.423C333.049 560.698 333.443 557.989 333.975 555.306C339.019 530.706 350.519 530.474 358.807 537.877C362.516 541.182 357.736 551.472 354.865 564.726C353.95 568.754 353.358 572.849 353.096 576.972C353.096 577.825 353.002 578.694 352.987 579.563C352.882 584.057 353.372 588.545 354.446 592.911C354.663 593.764 354.896 594.618 355.175 595.471C356.695 600.258 358.991 604.762 361.973 608.803C362.485 609.532 363.044 610.262 363.634 610.976C366.069 613.952 368.782 616.691 371.735 619.155C373.212 620.377 374.768 621.502 376.391 622.523C377.167 623.004 377.943 623.485 378.766 623.92C382.894 626.182 387.289 627.918 391.849 629.088L394.379 629.708C401.26 631.174 408.28 631.881 415.315 631.819H418.031C424.877 631.638 431.704 631.021 438.471 629.972L441.28 629.522C451.636 627.786 461.842 625.254 471.808 621.948L480.049 646.749Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.4"
                                    d="M354.725 564.726C347.12 561.514 338.538 562.243 332.718 563.423C332.972 560.698 333.365 557.989 333.897 555.306C338.941 530.706 350.442 530.474 358.729 537.877C362.376 541.182 357.596 551.472 354.725 564.726Z"
                                    fill="black"
                                />
                                <g opacity="0.4">
                                    <path
                                        d="M352.956 576.972C352.956 577.825 352.863 578.694 352.847 579.563C346.06 578.564 339.14 578.939 332.5 580.665C332.5 579.765 332.407 578.865 332.361 577.98C339.1 576.34 346.089 575.997 352.956 576.972Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M355.036 595.471C348.385 596.187 341.952 598.257 336.132 601.555C335.868 600.686 335.62 599.801 335.418 598.932C341.265 595.714 347.678 593.653 354.306 592.864C354.523 593.764 354.756 594.618 355.036 595.471Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M363.494 610.976C356.971 613.739 351.222 618.054 346.748 623.547C346.205 622.802 345.692 621.995 345.196 621.312C349.704 615.904 355.412 611.621 361.864 608.803C362.345 609.532 362.904 610.262 363.494 610.976Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M376.189 622.523C376.965 623.004 377.741 623.485 378.564 623.92C373.317 628.364 368.728 633.532 364.937 639.269C364.146 638.865 363.385 638.415 362.64 637.965C366.426 632.22 370.985 627.024 376.189 622.523Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M394.208 629.708C393.296 635.288 392.706 640.916 392.439 646.563C391.57 646.563 390.7 646.439 389.847 646.346C390.119 640.562 390.731 634.8 391.678 629.088L394.208 629.708Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M417.829 631.804C416.604 636.685 416.128 641.725 416.417 646.749H413.81C413.56 641.737 413.999 636.713 415.113 631.819H417.829V631.804Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M447.83 646.749H445.191C444.167 640.309 440.535 633.744 438.269 629.957L441.078 629.507C444.385 634.783 446.674 640.631 447.83 646.749Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M466.842 646.749H464.281C465.91 638.027 462.837 628.125 462.837 628.125C466.235 633.704 467.646 640.267 466.842 646.749Z"
                                        fill="black"
                                    />
                                </g>
                                <path
                                    d="M135.412 613.211C135.396 612.116 135.632 611.033 136.103 610.045C136.574 609.057 137.267 608.191 138.128 607.515C139.061 606.943 140.138 606.647 141.232 606.661C141.232 606.661 139.99 604.178 144.336 603.961C148.682 603.743 147.005 603.433 148.433 601.555C149.861 599.677 153.958 600.391 153.958 600.391C153.958 600.391 152.934 598.668 158.614 597.287C164.295 595.906 165.676 598.715 165.676 598.715C165.676 598.715 167.6 596.077 170.068 597.287C170.855 597.758 171.536 598.385 172.07 599.13C172.604 599.875 172.979 600.721 173.172 601.617C173.519 601.263 173.933 600.981 174.39 600.789C174.847 600.597 175.338 600.498 175.834 600.498C176.33 600.498 176.82 600.597 177.278 600.789C177.735 600.981 178.149 601.263 178.496 601.617L181.149 604.24C182.756 604.371 184.304 604.905 185.65 605.792C187.699 607.173 187.202 607.173 188.754 607.173C190.215 606.894 191.719 606.936 193.162 607.298C194.701 607.93 195.943 609.123 196.638 610.634C199.479 615.43 135.412 613.211 135.412 613.211Z"
                                    fill="#407BFF"
                                />
                                <path
                                    d="M212.779 646.749H118.837L125.712 611.348C125.792 610.929 125.957 610.531 126.197 610.178C126.437 609.826 126.748 609.527 127.109 609.3C127.613 608.974 128.2 608.802 128.8 608.803H202.815C203.203 608.802 203.588 608.876 203.948 609.02C204.447 609.208 204.888 609.521 205.231 609.929C205.573 610.336 205.805 610.825 205.904 611.348L207.456 619.574L209.008 627.412L209.908 632.068L210.994 637.593L212.779 646.749Z"
                                    fill="#263238"
                                />
                                <path
                                    opacity="0.4"
                                    d="M211.072 637.608H169.168C166.722 637.572 164.377 636.629 162.585 634.964C160.793 633.298 159.683 631.028 159.468 628.591C159.468 628.358 159.468 628.11 159.468 627.877C159.455 626.779 159.663 625.69 160.079 624.674C160.495 623.658 161.11 622.735 161.888 621.961C162.667 621.187 163.593 620.577 164.611 620.167C165.63 619.757 166.72 619.555 167.818 619.574H207.502L209.054 627.412L209.955 632.068L211.072 637.608Z"
                                    fill="white"
                                />
                                <g opacity="0.4">
                                    <path
                                        d="M174.584 624.742L173.032 629.088L170.86 624.742H169.432L172.443 630.624V630.857C172.225 631.447 171.946 631.664 171.465 631.664C171.08 631.663 170.71 631.519 170.425 631.26L169.96 632.269C170.404 632.614 170.949 632.805 171.512 632.812C172.474 632.812 173.203 632.409 173.638 631.074L175.888 624.742H174.584Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M182.422 624.742H181.056L181.289 627.706C181.382 628.886 180.777 629.476 179.737 629.476C178.697 629.476 178.325 628.979 178.185 627.924L177.952 624.82H176.571L176.835 628.172C176.823 628.526 176.886 628.879 177.02 629.207C177.154 629.536 177.355 629.832 177.612 630.077C177.868 630.322 178.174 630.509 178.508 630.628C178.842 630.746 179.198 630.793 179.551 630.764C179.899 630.778 180.246 630.711 180.563 630.568C180.881 630.425 181.161 630.211 181.382 629.941V630.686H182.686L182.422 624.742Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M194.217 627.256C194.181 626.732 193.99 626.23 193.668 625.814C193.346 625.398 192.908 625.088 192.409 624.921C191.91 624.755 191.373 624.741 190.866 624.88C190.359 625.02 189.905 625.306 189.561 625.704C189.326 625.386 189.016 625.131 188.659 624.96C188.302 624.79 187.908 624.71 187.513 624.727C187.159 624.708 186.807 624.772 186.483 624.915C186.16 625.058 185.874 625.275 185.65 625.549V624.789H184.347L184.797 630.655H186.162L185.945 627.675C185.852 626.511 186.426 625.922 187.326 625.922C188.227 625.922 188.692 626.434 188.77 627.474L189.003 630.655H190.384L190.151 627.675C190.058 626.511 190.648 625.922 191.548 625.922C192.448 625.922 192.898 626.434 192.976 627.474L193.224 630.655H194.59L194.217 627.256Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M205.764 627.256C205.728 626.732 205.537 626.23 205.215 625.814C204.893 625.398 204.455 625.088 203.956 624.921C203.457 624.755 202.92 624.741 202.413 624.88C201.906 625.02 201.452 625.306 201.108 625.704C200.873 625.386 200.563 625.131 200.206 624.96C199.848 624.79 199.455 624.71 199.06 624.727C198.706 624.708 198.354 624.772 198.03 624.915C197.706 625.058 197.421 625.275 197.197 625.549V624.789H195.893L196.344 630.655H197.709L197.492 627.675C197.399 626.511 197.973 625.922 198.873 625.922C199.773 625.922 200.239 626.434 200.317 627.474L200.549 630.655H201.76L201.527 627.675C201.434 626.511 202.024 625.922 202.924 625.922C203.824 625.922 204.274 626.434 204.352 627.474L204.6 630.655H205.966L205.764 627.256Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M209.023 627.412L207.689 624.742H206.261L209.256 630.624L209.179 630.857C208.961 631.447 208.697 631.664 208.216 631.664C207.832 631.663 207.461 631.519 207.176 631.26L206.695 632.269C207.141 632.612 207.685 632.802 208.247 632.812C208.546 632.825 208.843 632.766 209.113 632.639C209.383 632.512 209.619 632.321 209.799 632.083L209.023 627.412Z"
                                        fill="black"
                                    />
                                </g>
                                <path
                                    opacity="0.2"
                                    d="M193.333 607.173C193.148 607.409 192.922 607.609 192.665 607.763C192.124 608.028 191.53 608.166 190.927 608.167C188.295 608.17 185.679 607.772 183.167 606.987L181.429 606.537C181.265 606.5 181.096 606.5 180.932 606.537C180.606 606.537 180.327 606.879 180.001 606.832C179.675 606.785 179.535 606.537 179.272 606.428C178.604 606.18 177.952 607.08 177.254 606.956C177.046 606.895 176.844 606.817 176.649 606.723C176.345 606.684 176.037 606.684 175.733 606.723C175.103 606.744 174.479 606.589 173.931 606.277C173.383 605.965 172.932 605.507 172.629 604.954C171.728 606.254 170.38 607.176 168.842 607.546C168.074 607.705 167.274 607.612 166.564 607.279C165.853 606.946 165.269 606.391 164.9 605.699C164.791 605.451 164.698 605.156 164.45 605.032C164.202 604.908 163.736 605.156 163.534 605.482C163.397 605.82 163.214 606.139 162.991 606.428C162.606 606.71 162.132 606.842 161.656 606.801C159.563 607.078 157.438 606.646 155.619 605.575C155.517 605.463 155.393 605.374 155.253 605.315C155.114 605.256 154.963 605.228 154.812 605.233C154.533 605.233 154.362 605.544 154.191 605.761C153.707 606.383 153.103 606.901 152.416 607.288C151.73 607.674 150.973 607.919 150.19 608.01C149.407 608.101 148.614 608.036 147.857 607.818C147.1 607.599 146.394 607.233 145.779 606.739C145.552 607.047 145.219 607.261 144.843 607.338C144.468 607.416 144.077 607.351 143.746 607.158C143.576 607.049 143.42 606.894 143.219 606.894C143.017 606.894 142.768 607.096 142.567 607.267C141.894 607.667 141.137 607.906 140.356 607.965C139.576 608.024 138.792 607.902 138.066 607.608C138.999 607.037 140.075 606.741 141.17 606.754C141.17 606.754 139.928 604.271 144.274 604.054C148.62 603.837 146.943 603.526 148.371 601.648C149.799 599.77 153.896 600.484 153.896 600.484C153.896 600.484 152.872 598.762 158.552 597.38C164.233 595.999 165.614 598.808 165.614 598.808C165.614 598.808 167.538 596.17 170.006 597.38C170.792 597.851 171.474 598.478 172.008 599.223C172.542 599.968 172.917 600.815 173.11 601.71C173.457 601.356 173.871 601.075 174.328 600.882C174.785 600.69 175.276 600.591 175.772 600.591C176.268 600.591 176.758 600.69 177.215 600.882C177.673 601.075 178.087 601.356 178.433 601.71L181.087 604.333C182.694 604.464 184.242 604.998 185.588 605.885C187.637 607.267 187.14 607.267 188.692 607.267C190.211 606.88 191.799 606.848 193.333 607.173Z"
                                    fill="white"
                                />
                                <path
                                    opacity="0.1"
                                    d="M203.979 609.3C203.975 610.002 203.694 610.675 203.198 611.172C202.701 611.669 202.028 611.95 201.325 611.954H129.763C129.06 611.95 128.387 611.669 127.891 611.172C127.394 610.675 127.113 610.002 127.109 609.3C127.613 608.974 128.2 608.802 128.8 608.803H202.815C203.203 608.802 203.588 608.876 203.948 609.02C203.974 609.111 203.985 609.205 203.979 609.3Z"
                                    fill="white"
                                />
                            </svg>
                                <p className="text-xl text-gray-500 mt-6">Selecione uma conversa para começar a enviar mensagens</p>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
