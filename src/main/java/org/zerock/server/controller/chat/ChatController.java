package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.dto.chat.ChatMessageDTO;
import org.zerock.server.dto.chat.ChatNotice;
import org.zerock.server.service.chat.ChatService;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@Log
public class ChatController {

    private static final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    private final SimpMessagingTemplate messagingTemplate;

    private final ChatService chatService;

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessageDTO chatMessageDTO, SimpMessageHeaderAccessor headerAccessor) {

        // 사용자 이름을 세션에 저장
        headerAccessor.getSessionAttributes().put("username", chatMessageDTO.getSender());

        // 온라인 유저 목록에 추가
        onlineUsers.add(chatMessageDTO.getSender());

        // JOIN 메시지 브로드캐스트

        // 업데이트된 전체 온라인 유저 목록을 모든 클라이언트에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
    }


    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            onlineUsers.remove(username);

            ChatMessageDTO chatMessageDTO = new ChatMessageDTO();
            chatMessageDTO.setSender(username);
            chatMessageDTO.setType(ChatMessageDTO.MessageType.LEAVE);
            chatMessageDTO.setContent(username + "님이 퇴장하셨습니다.");

            messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
        }
    }


    @MessageMapping("/chat.dm")
    public void directMessage(@Payload ChatMessageDTO chatMessageDTO, SimpMessageHeaderAccessor headerAccessor) {
        // 수신자 ID (누구에게 보낼지)
        String to = chatMessageDTO.getReceiver();
        // 발신자 ID (누가 보냈는지)
        String from = chatMessageDTO.getSender();

        // 수신자가 없으면 무시
        if (to == null || to.isBlank()) {
            return;
        }

        // ★ 여기서 DB 저장 (현재 정책: 두 유저는 방 1개)
        try {
            Long meId = Long.valueOf(from);
            Long peerId = Long.valueOf(to);

            // 방 확보 + 메세지 저장
            ChatRoom room = chatService.getOrCreateRoom(meId, peerId);
            ChatMessage saved = chatService.sendMessage(room.getId(), meId, chatMessageDTO.getContent());

            // 저장 성공 후에만 전송
            messagingTemplate.convertAndSend("/topic/inbox." + to, chatMessageDTO);
            messagingTemplate.convertAndSend("/topic/inbox." + from, chatMessageDTO);

            // 알림 전송
            ChatNotice notice = new ChatNotice(
                    "NEW_MESSAGE",
                    room.getId(),
                    saved.getId(),
                    meId
            );
            messagingTemplate.convertAndSend("/topic/notice." + to, notice);

        } catch (Exception e) {
            log.warning("DM persist failed: " + e.getMessage());
        }
    }

}
