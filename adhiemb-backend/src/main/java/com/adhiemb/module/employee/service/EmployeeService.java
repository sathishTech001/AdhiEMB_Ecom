package com.adhiemb.module.employee.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.DuplicateResourceException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.employee.dto.CreateEmployeeRequest;
import com.adhiemb.module.employee.dto.EmployeeDTO;
import com.adhiemb.module.employee.dto.UpdateEmployeeRequest;
import com.adhiemb.module.employee.entity.Employee;
import com.adhiemb.module.employee.mapper.EmployeeMapper;
import com.adhiemb.module.employee.repository.EmployeeRepository;
import com.adhiemb.module.user.dto.CreateUserRequest;
import com.adhiemb.module.user.dto.UserDTO;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import com.adhiemb.module.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeDTO> getAllEmployees(Pageable pageable, String search) {
        Page<Employee> employees;
        if (search != null && !search.trim().isEmpty()) {
            employees = employeeRepository.searchEmployees(search.trim(), pageable);
        } else {
            employees = employeeRepository.findAll(pageable);
        }
        return PagedResponse.of(employees.map(EmployeeMapper::toDTO));
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .map(EmployeeMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmployeeId(request.employeeId())) {
            throw new DuplicateResourceException("Employee", "employeeId", request.employeeId());
        }

        // Create User first
        CreateUserRequest userRequest = new CreateUserRequest(
                request.email(),
                request.username(),
                request.password(),
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.roleId()
        );
        UserDTO userDTO = userService.createUser(userRequest);
        
        User user = userRepository.findById(userDTO.id())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDTO.id()));

        Employee employee = EmployeeMapper.toEntity(request);
        employee.setUser(user);
        
        employee = employeeRepository.save(employee);
        return EmployeeMapper.toDTO(employee);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.department() != null) {
            employee.setDepartment(request.department());
        }
        if (request.designation() != null) {
            employee.setDesignation(request.designation());
        }
        
        User user = employee.getUser();
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        userRepository.save(user);

        employee = employeeRepository.save(employee);
        return EmployeeMapper.toDTO(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        // Also delete the user (soft delete handled by user service, but let's just delete employee completely)
        employeeRepository.delete(employee);
        userService.deleteUser(employee.getUser().getId());
    }
}
