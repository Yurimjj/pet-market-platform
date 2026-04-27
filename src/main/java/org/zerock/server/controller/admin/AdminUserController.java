package org.zerock.server.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserInfoRepository userRepo;

    @GetMapping("/{userId}")
    public ResponseEntity<?> get(@PathVariable Long userId) {
        return userRepo.findById(userId)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
                        "userId", u.getUserId(),
                        "email", u.getEmail(),
                        "username", u.getUsername(),
                        "nickname", u.getNickname(),
                        "phoneNumber", u.getPhoneNumber(),
                        "isActive", u.isActive(),
                        "roleNames", u.getUserRoleList()  // [USER, MANAGER, ADMIN]
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/suspend")
    public ResponseEntity<?> suspend(@PathVariable Long userId, @RequestParam int days) {
        return ResponseEntity.ok(Map.of("result", "ok", "userId", userId, "days", days));
    }
}
