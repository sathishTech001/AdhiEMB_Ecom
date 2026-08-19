import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class Test {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        System.out.println("Owner@123: " + enc.encode("Owner@123"));
        System.out.println("Admin@123: " + enc.encode("Admin@123"));
        System.out.println("password: " + enc.encode("password"));
    }
}
