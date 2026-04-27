package org.zerock.server.controller.chat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatRestController {

    @GetMapping("/users")
    public List<String> getUsers() {
        return List.of("alice", "bob", "charlie");
    }
}
