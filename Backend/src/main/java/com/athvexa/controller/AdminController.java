package com.athvexa.controller;

import com.athvexa.service.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private RankingService rankingService;

    @PostMapping("/sync-points")
    public String syncPoints() {
        rankingService.updateAllUserPoints();
        return "User points synced successfully";
    }
}
