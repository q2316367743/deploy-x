-- 部署记录
CREATE TABLE deploy_record
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,

    project_id    TEXT    NOT NULL,
    instance_id   TEXT    NOT NULL,
    deploy_id     TEXT    NOT NULL,
    script_id     TEXT    NOT NULL,

    status        TEXT    NOT NULL DEFAULT 'pending',
    error_summary TEXT,
    started_at    TEXT    NOT NULL,
    finished_at   TEXT
);


-- 部署步骤
CREATE TABLE deploy_step
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,

    project_id  TEXT    NOT NULL,
    instance_id TEXT    NOT NULL,
    deploy_id   TEXT    NOT NULL,
    script_id   TEXT    NOT NULL,
    record_id   TEXT    NOT NULL,

    step_type   TEXT    NOT NULL,
    step_name   TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    started_at  TEXT,
    finished_at TEXT,
    error       TEXT,
    FOREIGN KEY (record_id) REFERENCES deploy_record (id) ON DELETE CASCADE
);

-- 步骤日志
CREATE TABLE deploy_log
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,

    project_id  TEXT    NOT NULL,
    instance_id TEXT    NOT NULL,
    deploy_id   TEXT    NOT NULL,
    record_id   TEXT    NOT NULL,
    step_id     TEXT    NOT NULL,

    line_num    INTEGER NOT NULL,
    stream      TEXT    NOT NULL DEFAULT 'stdout',
    content     TEXT    NOT NULL,
    FOREIGN KEY (record_id) REFERENCES deploy_record (id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES deploy_step (id) ON DELETE CASCADE
);

-- 核心索引：支撑轮询增量查询
CREATE INDEX idx_deploy_log_record_line ON deploy_log (record_id, line_num);