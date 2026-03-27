
-- 发版项目（ReleaseProject）
CREATE TABLE release_project
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    name       TEXT    NOT NULL,
    `desc`     TEXT    NOT NULL
);

CREATE UNIQUE INDEX idx_release_project_name_uindex ON release_project (name);

-- 版本表（ReleaseVersion）
CREATE TABLE release_version
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,

    project_id   TEXT    NOT NULL,
    version      TEXT    NOT NULL,
    publish_time INTEGER NOT NULL,
    publish_user TEXT    NOT NULL,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_version_project_id ON release_version (project_id);
CREATE UNIQUE INDEX idx_release_version_project_id_version_uindex ON release_version (project_id, version);
CREATE INDEX idx_release_version_project_id_deploy_time ON release_version (project_id, publish_time);

-- 版本日志（ReleaseVersionLog）
CREATE TABLE release_version_log
(
    id         TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    content    TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES release_version (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_version_log_project_id ON release_version_log (project_id);

-- 部署实例（ReleaseInstance）
CREATE TABLE release_instance
(
    id                 TEXT PRIMARY KEY,
    created_at         INTEGER NOT NULL,
    updated_at         INTEGER NOT NULL,

    project_id         TEXT    NOT NULL,
    name               TEXT    NOT NULL,
    `desc`             TEXT    NOT NULL,
    current_version_id TEXT,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_instance_project_id ON release_instance (project_id);
CREATE UNIQUE INDEX idx_release_instance_project_id_name_uindex ON release_instance (project_id, name);
CREATE INDEX idx_release_instance_current_version_id ON release_instance (current_version_id);

-- 发版部署记录（ReleaseDeploy）
CREATE TABLE release_deploy
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,

    project_id  TEXT    NOT NULL,
    version_id  TEXT    NOT NULL,
    instance_id TEXT    NOT NULL,

    deploy_time INTEGER NOT NULL,
    deploy_user TEXT    NOT NULL,

    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES release_version (id) ON DELETE CASCADE,
    FOREIGN KEY (instance_id) REFERENCES release_instance (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_deploy_project_id ON release_deploy (project_id);
CREATE INDEX idx_release_deploy_version_id ON release_deploy (version_id);
CREATE INDEX idx_release_deploy_instance_id ON release_deploy (instance_id);
CREATE UNIQUE INDEX idx_release_deploy_instance_id_version_id_uindex ON release_deploy (instance_id, version_id);

-- 发版资产元数据（ReleaseAssetMeta）
CREATE TABLE release_asset_meta
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,

    project_id    TEXT    NOT NULL,
    scope         TEXT    NOT NULL CHECK ( scope IN ('version', 'instance') ),
    scope_id      TEXT    NOT NULL,
    relative_path TEXT    NOT NULL,
    file_name     TEXT    NOT NULL,
    file_type     TEXT    NOT NULL CHECK ( file_type IN ('document', 'sql', 'other') ),
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_asset_meta_project_scope_scope_id
    ON release_asset_meta (project_id, scope, scope_id);
CREATE INDEX idx_release_asset_meta_project_file_type
    ON release_asset_meta (project_id, file_type);

-- 发版资产内容（ReleaseAssetContent）
CREATE TABLE release_asset_content
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    project_id TEXT    NOT NULL,
    language   TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    FOREIGN KEY (project_id) REFERENCES release_project (id) ON DELETE CASCADE
);

CREATE INDEX idx_release_asset_content_project_id ON release_asset_content (project_id);
CREATE INDEX idx_release_asset_content_project_id_language ON release_asset_content (project_id, language);
