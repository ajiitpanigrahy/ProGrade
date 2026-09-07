create table assessment_batch (
    assessment_id bigint not null,
    batch_id binary(16) not null,
    primary key (assessment_id, batch_id)
) engine=InnoDB;

create table assessment_questions (
    assessment_id bigint not null,
    question_id bigint not null
) engine=InnoDB;

create table assessment_submissions (
    correct_count integer not null,
    flagged_count integer not null,
    incorrect_count integer not null,
    max_score float(53) not null,
    time_taken_seconds integer,
    total_score float(53) not null,
    unattempted_count integer not null,
    assessment_id bigint,
    id bigint not null auto_increment,
    started_at datetime(6),
    submitted_at datetime(6),
    question_time_json TEXT,
    response_json TEXT,
    student_email varchar(255),
    student_name varchar(255),
    tech_breakdown_json TEXT,
    primary key (id)
) engine=InnoDB;

create table assessments (
    duration_minutes integer not null,
    max_attempts integer,
    negative_marks float(53) not null,
    positive_marks float(53) not null,
    total_questions integer not null,
    created_at datetime(6),
    id bigint not null auto_increment,
    start_time datetime(6),
    difficulty_level varchar(20),
    allowed_educators TEXT,
    creator_email varchar(255) not null,
    creator_role varchar(255) not null,
    description TEXT,
    exam_id varchar(255) not null,
    password varchar(255) not null,
    status varchar(255),
    tags varchar(255),
    title varchar(255) not null,
    creation_mode enum ('AUTOMATIC','MANUAL'),
    primary key (id)
) engine=InnoDB;

create table batch_students (
    batch_id binary(16) not null,
    id binary(16) not null,
    email varchar(255),
    name varchar(255),
    roll_number varchar(255),
    primary key (id)
) engine=InnoDB;

create table batches (
    created_at datetime(6),
    id binary(16) not null,
    name varchar(255) not null,
    primary key (id)
) engine=InnoDB;

create table chat_messages (
    is_flagged bit not null,
    is_view_once bit not null,
    delivered_at datetime(6),
    id bigint not null auto_increment,
    room_id bigint,
    seen_at datetime(6),
    timestamp datetime(6),
    content TEXT,
    file_name varchar(255),
    file_url varchar(255),
    sender_email varchar(255),
    status enum ('DELIVERED','SEEN','SENT'),
    primary key (id)
) engine=InnoDB;

create table chat_rooms (
    id bigint not null auto_increment,
    last_activity datetime(6),
    blocked_by_email varchar(255),
    initiator_email varchar(255),
    recipient_email varchar(255),
    status enum ('ACCEPTED','BLOCKED','PENDING'),
    primary key (id)
) engine=InnoDB;

create table logging_event (
    event_id bigint not null,
    timestmp bigint,
    caller_class varchar(255),
    formatted_message TEXT,
    level_string varchar(255),
    logger_name varchar(255),
    primary key (event_id)
) engine=InnoDB;

create table logging_event_property (
    event_id bigint not null,
    mapped_key varchar(255) not null,
    mapped_value varchar(255),
    primary key (event_id, mapped_key)
) engine=InnoDB;

create table malpractice_log (
    assessment_id bigint,
    id bigint not null auto_increment,
    timestamp datetime(6),
    details TEXT,
    infraction_type varchar(255),
    student_email varchar(255),
    primary key (id)
) engine=InnoDB;

create table notifications (
    is_read bit not null,
    created_at datetime(6),
    id bigint not null auto_increment,
    message TEXT,
    recipient_email varchar(255) not null,
    sender varchar(255),
    target_url varchar(255),
    title varchar(255),
    type enum ('ADMIN_ALERT','ASSESSMENT_CREATED','CHAT_MESSAGE','CRITICAL','EXAM_ASSIGNED','FRAUD_ALERT','INFO','PROMOTION','REPORT','SUCCESS','WARNING','WELCOME'),
    primary key (id)
) engine=InnoDB;

create table questions (
    correct_option varchar(5) not null,
    created_at datetime(6) not null,
    id bigint not null auto_increment,
    question_type varchar(20),
    code_language varchar(50),
    technology varchar(254) not null,
    topic varchar(254),
    code_snippet TEXT,
    created_by_email varchar(255),
    created_by_name varchar(255),
    creator_role varchar(255),
    explanation TEXT,
    optiona TEXT not null,
    optionb TEXT not null,
    optionc TEXT not null,
    optiond TEXT not null,
    question_text TEXT not null,
    difficulty_level enum ('EASY','HARD','MEDIUM') not null,
    primary key (id)
) engine=InnoDB;

create table system_reports (
    is_reopened bit not null,
    created_at datetime(6),
    id bigint not null auto_increment,
    investigating_at datetime(6),
    resolved_at datetime(6),
    updated_at datetime(6),
    admin_notes TEXT,
    cause TEXT,
    description TEXT,
    feature_name varchar(255),
    page_url varchar(255),
    reporter_email varchar(255),
    reporter_role varchar(255),
    suggestions TEXT,
    target_user_email varchar(255),
    severity enum ('HIGH','IMMEDIATE','LOW','MEDIUM'),
    status enum ('DISMISSED','INVESTIGATING','OPEN','RESOLVED'),
    type enum ('BUG_REPORT','CHAT_ABUSE','FEATURE_REQUEST','OTHER','USER_BEHAVIOR'),
    primary key (id)
) engine=InnoDB;

create table system_settings (
    admin_bypass bit not null,
    alert_admin_on_violation bit not null,
    disable_copy_paste bit not null,
    global_proctoring_aggression bit not null,
    idle_timeout_minutes integer not null,
    jwt_expiry_minutes integer not null,
    maintenance_mode bit not null,
    max_concurrent_logins integer not null,
    max_tab_switches_allowed integer not null,
    id bigint not null,
    maintenance_message varchar(255),
    sender_email varchar(255),
    primary key (id)
) engine=InnoDB;

create table token_blacklist (
    expiry_date datetime(6),
    id bigint not null auto_increment,
    token varchar(255) not null,
    primary key (id)
) engine=InnoDB;

create table users (
    is_approved bit not null,
    created_at datetime(6) not null,
    updated_at datetime(6) not null,
    id binary(16) not null,
    email varchar(255) not null,
    full_name varchar(255) not null,
    gender varchar(255),
    highest_qualification varchar(255),
    password varchar(255) not null,
    phone_number varchar(255),
    profile_picture_url varchar(255),
    roll_number varchar(255),
    status varchar(255) not null,
    role enum ('ADMIN','EDUCATOR','STUDENT') not null,
    primary key (id)
) engine=InnoDB;

alter table assessments 
   add constraint UKi0juli92hk5xi8pcrgl3irp76 unique (exam_id);

alter table batches 
   add constraint UKl64nkk5h594u0i97tjkb2bcho unique (name);

alter table token_blacklist 
   add constraint UKbff28eugoihk2swcdiybdej20 unique (token);

alter table users 
   add constraint UK6dotkott2kjsp8vw4d0m25fb7 unique (email);

alter table assessment_batch 
   add constraint FKrxxfca4jjco83702sgdcok0on 
   foreign key (batch_id) 
   references batches (id);

alter table assessment_batch 
   add constraint FK1e2n6pyj1rac8j8dfu31of2dn 
   foreign key (assessment_id) 
   references assessments (id);

alter table assessment_questions 
   add constraint FK31e26g9p042t6hcd6jmmhti0n 
   foreign key (question_id) 
   references questions (id);

alter table assessment_questions 
   add constraint FKljemcscn19ij7kysiqewaqp88 
   foreign key (assessment_id) 
   references assessments (id);

alter table batch_students 
   add constraint FKa3225kl4smnwa7ngmlphnalbo 
   foreign key (batch_id) 
   references batches (id);

alter table logging_event_property 
   add constraint FK8lpnrjabymv2al942njau5o93 
   foreign key (event_id) 
   references logging_event (event_id);