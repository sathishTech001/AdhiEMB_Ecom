package com.adhiemb.module.employee.dto;

public record UpdateEmployeeRequest(
        String firstName,
        String lastName,
        String phone,
        String department,
        String designation
) {
}
