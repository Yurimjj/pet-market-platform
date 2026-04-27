// src/main/java/org/zerock/server/controller/chat/ChatApiController.java
package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.chat.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.service.chat.ChatService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatApiController {

    private final ChatService chatService;
    private final UserInfoRepository userInfoRepository;

    @PostMapping("/rooms")
    @PreAuthorize("isAuthenticated()")
    public ChatRoomResponse getOrCreateRoom(@RequestBody RoomCreateRequest req,
                                            @AuthenticationPrincipal UserInfoDTO me) {
        ChatRoom room = chatService.getOrCreateRoom(me.getUserId(), req.getPeerId());
        return ChatRoomResponse.from(room);
    }

    @GetMapping("/rooms")
    @PreAuthorize("isAuthenticated()")
    public List<ChatRoomListItemDTO> getMyRooms(@AuthenticationPrincipal UserInfoDTO me) {
        Long meId = me.getUserId();
        return chatService.getMyRooms(meId)
                .stream()
                .map(r -> ChatRoomListItemDTO.from(r, meId, null)) // 닉네임은 프런트가 처리
                .toList();
    }


    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageResponseDTO> getRoomMessages(@PathVariable Long roomId,
                                                        @AuthenticationPrincipal UserInfoDTO me) {

        List<ChatMessage> list = chatService.getRoomMessages(roomId, me.getUserId());
        return list.stream()
                .map(m -> ChatMessageResponseDTO.from(m, null))
                .toList();
    }

    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ChatMessageResponseDTO sendMessage(@RequestBody ChatMessageSendRequest req,
                                              @AuthenticationPrincipal UserInfoDTO me) {
        ChatMessage saved = chatService.sendMessage(req.getRoomId(), me.getUserId(), req.getContent());
        return ChatMessageResponseDTO.from(saved, null);
    }

    @GetMapping("/users/{userId}/nickname")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getNickname(@PathVariable Long userId) {
        String nickname = userInfoRepository.findById(userId)
                .map(UserInfo::getNickname)
                .orElse("");
        return Map.of("userId", userId, "nickname", nickname);
    }

    @DeleteMapping("/rooms/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public void deleteRoomForMe(@PathVariable Long roomId,
                                @AuthenticationPrincipal UserInfoDTO me) {
        chatService.deleteRoomForMe(roomId, me.getUserId());
    }

    @PostMapping("/rooms/{roomId}/context")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> setRoomContext(@PathVariable Long roomId,
                                              @RequestBody Map<String, Long> body,
                                              @AuthenticationPrincipal UserInfoDTO me) {
        Long productId = body.get("productId");
        chatService.upsertRoomContext(roomId, productId, me.getUserId());
        return Map.of("roomId", roomId, "productId", productId);
    }

    @GetMapping("/rooms/{roomId}/context")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getRoomContext(@PathVariable Long roomId,
                                              @AuthenticationPrincipal UserInfoDTO me) {
        Long pid = chatService.getRoomContextProductId(roomId, me.getUserId());
        return Map.of("roomId", roomId, "productId", pid);
    }
}
