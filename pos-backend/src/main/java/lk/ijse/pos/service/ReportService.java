package lk.ijse.pos.service;

import lk.ijse.pos.dto.SalesReportDto;
import lk.ijse.pos.dto.UserHoursDto;
import lk.ijse.pos.entity.UserLoginDetailsEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface ReportService {
    public List<SalesReportDto> getSalesReport(String period, String reportType, LocalDate startDate, LocalDate endDate);
    public List<String> getSalesDates();
    public List<UserLoginDetailsEntity> getUserLoginDetails();
    public List<UserHoursDto> getUserHoursWorked();
}
