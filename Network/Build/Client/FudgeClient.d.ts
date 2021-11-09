/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace Messages {
    enum MESSAGE_TYPE {
        UNDEFINED = "undefined",
        ERROR = "error",
        ID_ASSIGNED = "idAssigned",
        LOGIN_REQUEST = "loginRequest",
        LOGIN_RESPONSE = "loginResponse",
        CLIENT_TO_SERVER = "clientToServer",
        SERVER_TO_CLIENT = "serverToClient",
        PEER_TO_PEER = "peerToPeer",
        SERVER_HEARTBEAT = "serverHeartbeat",
        CLIENT_HEARTBEAT = "clientHeartbeat",
        RTC_OFFER = "rtcOffer",
        RTC_ANSWER = "rtcAnswer",
        ICE_CANDIDATE = "rtcCandidate"
    }
    enum SERVER_COMMAND {
        UNDEFINED = "undefined",
        DISCONNECT_CLIENT = "disconnect_client",
        CREATE_MESH = "createMesh",
        CONNECT_HOST = "connectHost",
        CONNECT_PEERS = "connectPeers"
    }
    enum NET_COMMAND {
        UNDEFINED = "undefined",
        ERROR = "error",
        ASSIGN_ID = "assignId",
        LOGIN_REQUEST = "loginRequest",
        LOGIN_RESPONSE = "loginResponse",
        SERVER_HEARTBEAT = "serverHeartbeat",
        CLIENT_HEARTBEAT = "clientHeartbeat",
        RTC_OFFER = "rtcOffer",
        RTC_ANSWER = "rtcAnswer",
        ICE_CANDIDATE = "rtcCandidate"
    }
    enum NET_ROUTE {
        SERVER = "toServer",
        CLIENT = "toClient",
        HOST = "toHost",
        ALL = "toAll",
        VIA_SERVER_CLIENT = "viaServerToClient",
        VIA_SERVER_HOST = "viaServerToHost",
        VIA_SERVER_ALL = "viaServerToAll"
    }
    interface NetMessage {
        /** the route the message is supposed to take */
        route: NET_ROUTE;
        /** the command the message is supposed to trigger */
        command: NET_COMMAND;
        idSource?: string; /** the id of the client sending the message, undefined for server. Automatically inserted by send-method */
        idTarget?: string; /** the id of the intended recipient of the message, undefined for messages to the server or to all */
        timeServer?: number; /** the timestamp of the server sending or passing this message. Automatically set by send- or pass-method */
        timeSender?: number; /** the timestamp of the sender. Automatically set by send-method */
        content?: Object; /** the actual content of the message as a simple javascript object like a FUDGE-Mutator */
    }
    class MessageBase {
        readonly messageType: MESSAGE_TYPE;
        readonly idSource: string;
        constructor(messageType: MESSAGE_TYPE, idSource: string);
        static deserialize(_message: string): MessageBase;
        serialize(): string;
    }
    class IdAssigned extends MessageBase {
        assignedId: string;
        constructor(assignedId: string);
    }
    class LoginRequest extends MessageBase {
        loginUserName: string;
        constructor(_idSource: string, loginUserName?: string);
    }
    class LoginResponse extends MessageBase {
        loginSuccess: boolean;
        originatorUsername: string;
        constructor(loginSuccess: boolean, _assignedId: string, originatorUsername: string);
    }
    class RtcOffer extends MessageBase {
        idRemote: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined;
        constructor(_idSource: string, idRemote: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined);
    }
    class RtcAnswer extends MessageBase {
        idTarget: string;
        answer: RTCSessionDescription;
        constructor(_idSource: string, idTarget: string, answer: RTCSessionDescription);
    }
    class IceCandidate extends MessageBase {
        idTarget: string;
        candidate: RTCIceCandidate;
        constructor(_idSource: string, idTarget: string, candidate: RTCIceCandidate);
    }
    class ToServer extends MessageBase {
        messageData: string;
        originatorUserName: string;
        constructor(_idSource: string, messageData: string, originatorUserName: string);
    }
    class ToClient extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class PeerToPeer extends MessageBase {
        messageData: string;
        constructor(_idSource: string, messageData: string);
    }
    class ServerHeartbeat extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class ClientHeartbeat extends MessageBase {
        messageData: string;
        constructor(_idSource: string, messageData: string);
    }
}
declare namespace FudgeClient {
    class FudgeClient extends EventTarget {
        id: string;
        name: string;
        urlServer: string | undefined;
        socket: WebSocket;
        peers: {
            [id: string]: RtcConnection;
        };
        constructor();
        connectToServer: (_uri?: string) => void;
        loginToServer: (_requestingUsername: string) => void;
        sendToServer: (_message: Messages.MessageBase) => void;
        connectToPeer: (_idRemote: string) => void;
        sendToPeer: (_idRemote: string, _message: object) => void;
        sendToAllPeers: (_message: object) => void;
        private addWebSocketEventListeners;
        private parseMessageAndHandleMessageType;
        private beginPeerConnectionNegotiation;
        private createNegotiationOfferAndSendToPeer;
        private receiveNegotiationOfferAndSetRemoteDescription;
        private answerNegotiationOffer;
        private receiveAnswerAndSetRemoteDescription;
        private sendIceCandidatesToPeer;
        private addReceivedCandidateToPeerConnection;
        private receiveDataChannelAndEstablishConnection;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
    }
}
declare namespace FudgeClient {
    enum EVENT {
        CONNECTION_OPENED = "open",
        CONNECTION_CLOSED = "close",
        MESSAGE_RECEIVED = "message"
    }
    let configuration: {
        iceServers: {
            urls: string;
        }[];
    };
    class RtcConnection {
        peerConnection: RTCPeerConnection;
        dataChannel: RTCDataChannel | undefined;
        mediaStream: MediaStream | undefined;
        constructor();
        createDataChannel(_client: FudgeClient, _idRemote: string): void;
        addDataChannel(_client: FudgeClient, _dataChannel: RTCDataChannel): void;
    }
}
