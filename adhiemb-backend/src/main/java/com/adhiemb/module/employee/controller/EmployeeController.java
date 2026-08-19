package com.adhiemb.module.employee.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.employee.dto.CreateEmployeeRequest;
import com.adhiemb.module.employee.dto.EmployeeDTO;
import com.adhiemb.module.employee.dto.UpdateEmployeeRequest;
import com.adhiemb.module.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_VIEW')")
    public ApiResponse<PagedResponse<EmployeeDTO>> getAllEmployees(Pageable pageable, @RequestParam(required = false) String search) {
        return ApiResponse.success(employeeService.getAllEmployees(pageable, search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_VIEW')")
    public ApiResponse<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        return ApiResponse.success(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ApiResponse<EmployeeDTO> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ApiResponse.success("Employee created successfully", employeeService.createEmployee(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ApiResponse<EmployeeDTO> updateEmployee(@PathVariable Long id, @Valid @RequestBody UpdateEmployeeRequest request) {
        return ApiResponse.success("Employee updated successfully", employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    public ApiResponse<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ApiResponse.success("Employee deleted successfully", null);
    }
}
