package lk.ijse.pos.controller;

import lk.ijse.pos.dto.SalesReportDto;
import lk.ijse.pos.dto.UserHoursDto;
import lk.ijse.pos.entity.UserLoginDetailsEntity;
import lk.ijse.pos.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins ="*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<List<SalesReportDto>> getSalesReport(
            @RequestParam String period,
            @RequestParam String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SalesReportDto> report = reportService.getSalesReport(period, reportType, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/salesDates")
    public ResponseEntity<List<String>> getSalesDates(){
        return ResponseEntity.ok(reportService.getSalesDates());
    }

    @GetMapping("/loginDetails")
    public ResponseEntity<List<UserLoginDetailsEntity>> getUserLoginDetails(){
        return ResponseEntity.ok(reportService.getUserLoginDetails());
    }

    @GetMapping("/userHours")
    public ResponseEntity<List<UserHoursDto>> getUserHours(){
        return ResponseEntity.ok(reportService.getUserHoursWorked());
    }

}
