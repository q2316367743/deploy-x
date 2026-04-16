-- 主机表
CREATE TABLE host
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,

    name          TEXT    NOT NULL,
    host          TEXT    NOT NULL,
    port          INTEGER NOT NULL DEFAULT 22,
    auth_type     TEXT    NOT NULL DEFAULT 'password',
    auth_user     TEXT    NOT NULL,
    auth_password TEXT    NOT NULL,
    auth_secret   TEXT    NOT NULL,
    credential_id TEXT    NOT NULL,
    remark        TEXT
);

-- 主机凭证表
CREATE TABLE host_credential
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    name       TEXT    NOT NULL DEFAULT '',
    -- 类型 password/secret
    type       TEXT    NOT NULL DEFAULT 'password',

    username   TEXT    NOT NULL DEFAULT '',
    password   TEXT    NOT NULL DEFAULT '',
    secret     TEXT    NOT NULL DEFAULT ''

);

-- 流程脚本表
CREATE TABLE deploy_script
(
    id                   TEXT PRIMARY KEY,
    -- 元数据
    created_at           INTEGER NOT NULL,
    updated_at           INTEGER NOT NULL,

    project_id           TEXT    NOT NULL,
    instance_id          TEXT    NOT NULL,
    version_id           TEXT    NOT NULL,

    name                 TEXT    NOT NULL,
    script_type          TEXT    NOT NULL DEFAULT 'remote', -- 'remote' 或 'local'
    description          TEXT,

    local_work_dir       TEXT    NOT NULL DEFAULT '',
    local_commands       TEXT    NOT NULL DEFAULT '[]',
    build_output_dir     TEXT    NOT NULL DEFAULT '',

    scan_depth           TEXT    NOT NULL DEFAULT 'deep',
    match_mode           TEXT    NOT NULL DEFAULT 'none',
    match_rules          TEXT    NOT NULL DEFAULT '[]',

    -- 传输（决定了后续能力边界）
    target_host_id       TEXT    NOT NULL,
    target_dir           TEXT    NOT NULL DEFAULT '',
    keep_versions        INTEGER NOT NULL DEFAULT 0,

    -- 执行（前端根据 target_host_id 的类型决定是否渲染这些配置）
    deploy_path          TEXT    NOT NULL DEFAULT '',
    pre_deploy_commands  TEXT    NOT NULL DEFAULT '[]',
    post_deploy_commands TEXT    NOT NULL DEFAULT '[]',

    FOREIGN KEY (instance_id) REFERENCES release_instance (id) ON DELETE CASCADE,
    FOREIGN KEY (target_host_id) REFERENCES host (id)
);