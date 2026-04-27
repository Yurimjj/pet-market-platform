package org.zerock.server.controller.board;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.board.BoardCommentDTO;
import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.CommentPageDTO;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.repository.board.BoardAttachmentRepository;
import org.zerock.server.repository.board.BoardCategoryRepository;
import org.zerock.server.repository.board.BoardCommentRepository;
import org.zerock.server.repository.board.BoardPostRepository;
import org.zerock.server.service.board.BoardCommentService;
import org.zerock.server.util.CustomFileUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/comment")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;

    // 댓글 등록
    @PostMapping("/")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> register(
            @RequestBody BoardCommentDTO boardCommentDTO,  // 댓글 형태는 JSON
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("댓글 등록 요청: " + boardCommentDTO);
        log.info("요청 사용자 ID (JWT에서 추출): " + userInfoDTO.getUserId());


        try{
            Long commentId = boardCommentService.register(boardCommentDTO, userInfoDTO.getUserId());
            return ResponseEntity.ok(Map.of("commentId", commentId));
        }catch (IllegalArgumentException e){
            log.warn("댓글/대댓글 등록 실패 (잘못된요청): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", -1L));
        }catch (Exception e){
            log.error("게시글 등록 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> removeComment(
            @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("댓글 삭제 요청: commentId=" + commentId);
        log.info("요청 사용자 ID (JWT에서 추출): " + userInfoDTO.getUserId());

        try {
            boardCommentService.removeComment(commentId, userInfoDTO.getUserId());
            return ResponseEntity.ok(Map.of("message", "댓글이 성공적으로 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            log.warn("댓글 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 삭제 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류로 댓글 삭제에 실패했습니다."));
        }
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateComment(
            @PathVariable("commentId") Long commentId,
            @RequestBody BoardCommentDTO boardCommentDTO,
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("댓글 수정 요청: commentId=" + commentId + ", 새로운 내용=" + boardCommentDTO.getContent());
        log.info("요청 사용자 ID (JWT에서 추출): " + userInfoDTO.getUserId());

        try {
            boardCommentService.updateComment(commentId, userInfoDTO.getUserId(), boardCommentDTO.getContent());
            return ResponseEntity.ok(Map.of("message", "댓글이 성공적으로 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            log.warn("댓글 수정 실패: " + e.getMessage());
            HttpStatus status = e.getMessage().contains("권한이 없습니다") ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) { // 댓글이 없을 경우 NoSuchElementException 발생 가능
            log.warn("댓글 수정 실패 (댓글을 찾을 수 없음): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 수정 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류로 댓글 수정에 실패했습니다."));
        }
    }

    @GetMapping("/board/{postId}")
    public ResponseEntity<CommentPageDTO> getCommentsByPost(
            @PathVariable("postId") Long postId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        log.info("게시글 ID {}의 댓글 목록 조회 요청 (페이지: {}, 크기: {})", postId, page, size);

        try {
            CommentPageDTO comments = boardCommentService.getParentCommentsWithPaging(postId, page, size);
            return ResponseEntity.ok(comments);
        } catch (NoSuchElementException e) {
            log.warn("댓글을 찾을 수 없는 게시글: " + postId + ", " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("댓글 조회 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();

        }

    }

    @GetMapping("/board/{postId}/count")
    public ResponseEntity<Map<String, Long>> getTotalCommentsCount(@PathVariable("postId") Long postId) {
        log.info("게시글 ID {}의 전체 댓글 개수 조회 요청", postId);
        try {
            Long count = boardCommentService.getTotalCommentCount(postId);
            return ResponseEntity.ok(Map.of("totalComments", count));
        } catch (Exception e) {
            log.error("전체 댓글 개수 조회 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

}
