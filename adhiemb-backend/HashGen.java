import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH_OWNER=" + encoder.encode("Owner@123"));
        System.out.println("HASH_ADMIN=" + encoder.encode("Admin@123"));
    }
}
