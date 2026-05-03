package com.athvexa.controller;

import com.athvexa.dto.UserDTO;
import com.athvexa.service.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@CrossOrigin(origins = "*")
public class RankingController {
    
    @Autowired
    private RankingService rankingService;
    
    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllRankings() {
        List<UserDTO> rankings = rankingService.getAllRankings();
        return ResponseEntity.ok(rankings);
    }
    
    @GetMapping("/sport/{sport}")
    public ResponseEntity<List<UserDTO>> getRankingsBySport(@PathVariable String sport) {
        List<UserDTO> rankings = rankingService.getRankingsBySport(sport);
        return ResponseEntity.ok(rankings);
    }
    
    @GetMapping("/occupation/{occupation}")
    public ResponseEntity<List<UserDTO>> getRankingsByOccupation(@PathVariable String occupation) {
        List<UserDTO> rankings = rankingService.getRankingsByOccupation(occupation.toUpperCase());
        return ResponseEntity.ok(rankings);
    }
    
    @GetMapping("/occupation/{occupation}/gender/{gender}")
    public ResponseEntity<List<UserDTO>> getRankingsByOccupationAndGender(
            @PathVariable String occupation,
            @PathVariable String gender) {
        List<UserDTO> rankings = rankingService.getRankingsByOccupationAndGender(
            occupation.toUpperCase(),
            gender.toUpperCase()
        );
        return ResponseEntity.ok(rankings);
    }
    
    @GetMapping("/gender/{gender}")
    public ResponseEntity<List<UserDTO>> getRankingsByGender(@PathVariable String gender) {
        List<UserDTO> rankings = rankingService.getRankingsByGender(gender.toUpperCase());
        return ResponseEntity.ok(rankings);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDTO> getUserRanking(@PathVariable String userId) {
        try {
            UserDTO ranking = rankingService.getUserRanking(userId);
            return ResponseEntity.ok(ranking);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/user/{userId}/position")
    public ResponseEntity<Integer> getUserRankPosition(@PathVariable String userId) {
        Integer position = rankingService.getUserRankPosition(userId);
        return ResponseEntity.ok(position);
    }
    
    @GetMapping("/sports")
    public ResponseEntity<List<String>> getAllSports() {
        List<String> sports = rankingService.getAllSports();
        return ResponseEntity.ok(sports);
    }
    
    @GetMapping("/empty")
    public ResponseEntity<Boolean> isEmptyRankings() {
        boolean isEmpty = rankingService.isEmptyRankings();
        return ResponseEntity.ok(isEmpty);
    }
}
