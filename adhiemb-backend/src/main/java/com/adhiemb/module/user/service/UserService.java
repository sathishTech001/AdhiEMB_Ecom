package com.adhiemb.module.user.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.DuplicateResourceException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.role.entity.Role;
import com.adhiemb.module.role.repository.RoleRepository;
import com.adhiemb.module.user.dto.CreateUserRequest;
import com.adhiemb.module.user.dto.UpdateStatusRequest;
import com.adhiemb.module.user.dto.UpdateUserRequest;
import com.adhiemb.module.user.dto.UserDTO;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.enums.UserStatus;
import com.adhiemb.module.user.mapper.UserMapper;
import com.adhiemb.module.user.repository.UserRepository;
import com.adhiemb.storage.FstoreStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerUrnGeneratorService customerUrnGeneratorService;
    private final FstoreStorageService fstoreStorageService;

    @Transactional(readOnly = true)
    public PagedResponse<UserDTO> getAllUsers(Pageable pageable, String search) {
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.searchUsers(search.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return PagedResponse.of(users.map(UserMapper::toDTO));
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("User", "email", request.email());
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("User", "username", request.username());
        }

        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));

        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.roleId()));
            user.setRole(role);
            if ("CUST".equalsIgnoreCase(role.getCode()) && user.getCustomerUrn() == null) {
                user.setCustomerUrn(customerUrnGeneratorService.generateNextUrn());
            }
        }

        user = userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (StringUtils.hasText(request.avatarUrl())) {
            String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(request.avatarUrl(), "users");
            user.setAvatarUrl(storedUrl);
        }
        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.roleId()));
            user.setRole(role);
        }

        user = userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserDTO updateStatus(Long id, UpdateStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setStatus(request.status());
        user = userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }
}
