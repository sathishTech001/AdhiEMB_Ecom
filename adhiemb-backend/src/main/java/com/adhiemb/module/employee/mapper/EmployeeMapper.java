package com.adhiemb.module.employee.mapper;

import com.adhiemb.module.employee.dto.CreateEmployeeRequest;
import com.adhiemb.module.employee.dto.EmployeeDTO;
import com.adhiemb.module.employee.entity.Employee;
import com.adhiemb.module.user.mapper.UserMapper;

public class EmployeeMapper {

    public static EmployeeDTO toDTO(Employee employee) {
        if (employee == null) {
            return null;
        }

        return new EmployeeDTO(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getJoiningDate(),
                UserMapper.toDTO(employee.getUser())
        );
    }

    public static Employee toEntity(CreateEmployeeRequest request) {
        if (request == null) {
            return null;
        }

        return Employee.builder()
                .employeeId(request.employeeId())
                .department(request.department())
                .designation(request.designation())
                .joiningDate(request.joiningDate())
                .build();
    }
}
