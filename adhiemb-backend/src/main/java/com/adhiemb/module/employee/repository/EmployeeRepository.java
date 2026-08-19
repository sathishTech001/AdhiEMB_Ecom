package com.adhiemb.module.employee.repository;

import com.adhiemb.module.employee.entity.Employee;
import com.adhiemb.module.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByUser(User user);
    boolean existsByEmployeeId(String employeeId);
    
    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.designation) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.user.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Employee> searchEmployees(@Param("search") String search, Pageable pageable);
}
