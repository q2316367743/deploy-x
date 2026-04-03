use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::Path;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMapper {
    pub source: String,
    pub target: String,
}

#[tauri::command]
pub fn compress_to(path: String, mapper: Vec<FileMapper>) -> Result<(), String> {
    let file_path = Path::new(&path);
    
    let file = File::create(file_path)
        .map_err(|e| format!("创建压缩文件失败: {}", e))?;
    
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);
    
    for item in mapper {
        let source_path = Path::new(&item.source);
        
        if !source_path.exists() {
            return Err(format!("源文件不存在: {}", item.source));
        }
        
        if source_path.is_file() {
            let mut source_file = File::open(source_path)
                .map_err(|e| format!("打开源文件失败 {}: {}", item.source, e))?;
            
            let mut buffer = Vec::new();
            source_file.read_to_end(&mut buffer)
                .map_err(|e| format!("读取源文件失败 {}: {}", item.source, e))?;
            
            zip.start_file(&item.target, options)
                .map_err(|e| format!("添加文件到压缩包失败: {}", e))?;
            
            zip.write_all(&buffer)
                .map_err(|e| format!("写入文件内容失败: {}", e))?;
        } else if source_path.is_dir() {
            add_directory_to_zip(&mut zip, source_path, &item.target, options)?;
        }
    }
    
    zip.finish()
        .map_err(|e| format!("完成压缩文件失败: {}", e))?;
    
    Ok(())
}

fn add_directory_to_zip<W: io::Write + io::Seek>(
    zip: &mut ZipWriter<W>,
    source_dir: &Path,
    target_prefix: &str,
    options: SimpleFileOptions,
) -> Result<(), String> {
    let entries = std::fs::read_dir(source_dir)
        .map_err(|e| format!("读取目录失败: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let path = entry.path();
        
        let file_name = path.file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| "无效的文件名".to_string())?;
        
        let target_path = if target_prefix.is_empty() || target_prefix.ends_with('/') {
            format!("{}{}", target_prefix, file_name)
        } else {
            format!("{}/{}", target_prefix, file_name)
        };
        
        if path.is_file() {
            let mut file = File::open(&path)
                .map_err(|e| format!("打开文件失败: {}", e))?;
            
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)
                .map_err(|e| format!("读取文件失败: {}", e))?;
            
            zip.start_file(&target_path, options)
                .map_err(|e| format!("添加文件到压缩包失败: {}", e))?;
            
            zip.write_all(&buffer)
                .map_err(|e| format!("写入文件内容失败: {}", e))?;
        } else if path.is_dir() {
            add_directory_to_zip(zip, &path, &target_path, options)?;
        }
    }
    
    Ok(())
}
