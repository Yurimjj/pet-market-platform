package org.zerock.server.config;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

// 현재 사용 안 함
@Component
public class WebSocketEventListener {

    private final Set<String> onlineUsers = Collections.synchronizedSet(new HashSet<>());

    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }

    public void addOnlineUser(String username) {
        onlineUsers.add(username);
    }

    public void removeOnlineUser(String username) {
        onlineUsers.remove(username);
    }
}
