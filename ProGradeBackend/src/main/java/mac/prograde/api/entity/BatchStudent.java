package mac.prograde.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "batch_students")
@Data
public class BatchStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String rollNumber;
    private String name;
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;
}