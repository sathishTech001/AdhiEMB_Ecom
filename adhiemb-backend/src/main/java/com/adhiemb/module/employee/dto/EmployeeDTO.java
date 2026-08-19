package com.adhiemb.module.employee.dto;

import com.adhiemb.module.user.dto.UserDTO;
import java.time.LocalDate;

public record EmployeeDTO(
        Long id,
        String employeeId,
        String department,
        String designation,
        LocalDate joiningDate,
        UserDTO user
) {
}
